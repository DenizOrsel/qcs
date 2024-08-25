import axios from "axios";
import AdmZip from "adm-zip";
import { Readable } from "stream";
import csvtojson from "csvtojson";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests are allowed" });
  }

  const token = req.headers["authorization"];
  const apiBaseUrl = req.headers["x-custom-url"];
  const { interviewId, surveyId } = req.query;

  if (!surveyId || !interviewId || !token || !apiBaseUrl) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const downloadResponse = await axios.post(
      `${apiBaseUrl}Surveys/${surveyId}/DataDownload/${interviewId}`,
      {
        IncludeSuccessful: true,
        IncludeRejected: true,
        IncludeCapturedMediaFiles: true,
        IncludeAuditLog: true,
      },
      {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const activityId = downloadResponse.data.ActivityId;

    if (!activityId) {
      return res
        .status(500)
        .json({ message: "Failed to initiate download activity" });
    }

    let activityStatus = 0;
    let downloadUrl = "";
    const maxRetries = 20;
    const retryInterval = 5000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const activityResponse = await axios.get(
        `${apiBaseUrl}BackgroundActivities/${activityId}`,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      activityStatus = activityResponse.data.Status;

      if (activityStatus === 2) {
        downloadUrl = activityResponse.data.DownloadDataUrl;
        break;
      } else if (activityStatus === 3) {
        return res.status(500).json({ message: "Download activity failed" });
      }

      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }

    if (!downloadUrl) {
      return res
        .status(500)
        .json({ message: "Download activity timed out or failed to complete" });
    }

    const zipResponse = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });

    const zip = new AdmZip(zipResponse.data);
    const zipEntries = zip.getEntries();

    const files = [];

    // Handle the audit log CSV file
    const auditFileEntry = zipEntries.find(
      (entry) =>
        entry.entryName.endsWith(".csv") && entry.entryName.includes("auditlog")
    );

    if (auditFileEntry) {
      const auditFile = await csvtojson({ delimiter: "\t" }).fromString(
        auditFileEntry.getData().toString("utf-16le")
      );

      files.push({
        filename: "auditlog.json",
        content: auditFile,
      });
    }

    // Handle the MPEG file if it exists
    const mpegFileEntry = zipEntries.find(
      (entry) =>
        entry.entryName.endsWith(".mpeg4") && entry.entryName.includes("silent")
    );

    if (mpegFileEntry) {
      const mpegData = mpegFileEntry.getData();

      // Upload MPEG4 to Cloudinary and convert it to MP3
      const uploadResult = await cloudinary.uploader.upload(
        `data:video/mp4;base64,${mpegData.toString("base64")}`,
        {
          resource_type: "video",
          public_id: "silent",
          format: "mp3",
        }
      );

      if (uploadResult.secure_url) {
        files.push({
          filename: "silent.mp3",
          content: uploadResult.secure_url,
        });
      }
    }

    // Handle the JPEG files if they exist
    const jpgEntries = zipEntries.filter((entry) =>
      entry.entryName.endsWith(".jpg")
    );

    if (jpgEntries.length > 0) {
      jpgEntries.forEach((entry) => {
        files.push({
          filename: entry.entryName,
          content: entry.getData().toString("base64"),
        });
      });
    }

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error processing download package:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
