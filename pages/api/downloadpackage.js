import axios from "axios";
import AdmZip from "adm-zip";

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
    const maxRetries = 20; // Maximum number of retries
    const retryInterval = 5000; // Poll every 5 seconds

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

    const files = zipEntries
      .filter(
        (entry) =>
          entry.entryName.endsWith(".jpg") || entry.entryName.endsWith(".mpeg4")
      )
      .map((entry) => {
        return {
          filename: entry.entryName,
          content: entry.getData().toString("base64"),
        };
      });

    return res.status(200).json({ files });
  } catch (error) {
    console.error("Error processing download package:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
