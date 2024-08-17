import axios from "axios";
import AdmZip from "adm-zip";
import StreamPot from "@streampot/client";
import { Readable } from "stream";

const streampot = new StreamPot({
  secret: process.env.STREAMING_SERVER,
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
        IncludeCapturedMediaFiles: true,
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

        if (zipEntries.length < 7) {
          return res
            .status(404)
            .json({ message: "There is nothing to stream" });
        }

    const mpegFileEntry = zipEntries.find((entry) =>
      entry.entryName.endsWith(".mpeg4") && entry.entryName.includes("silent")
    );

    const jpgEntries = zipEntries.filter((entry) =>
      entry.entryName.endsWith(".jpg")
    );

    const mpegData = mpegFileEntry.getData();
    const mpegStream = new Readable();
    mpegStream._read = () => {};
    mpegStream.push(mpegData);
    mpegStream.push(null);

    const clip = await streampot
      .input("data:video/mp4;base64," + mpegData.toString("base64"))
      .output("silent.mp3")
      .runAndWait();

    const audioFile = clip.outputs["silent.mp3"];

    const files = jpgEntries.map((entry) => ({
      filename: entry.entryName,
      content: entry.getData().toString("base64"),
    }));

    
    files.push({
      filename: "silent.mp3",
      content: audioFile,
    });


    res.status(200).json({ files });
  } catch (error) {
    console.error("Error processing download package:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
