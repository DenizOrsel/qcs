import axios from "axios";
import AdmZip from "adm-zip";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { PassThrough } from "stream";
import { Readable } from "stream";

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

    const mpegFileEntry = zipEntries.find((entry) =>
      entry.entryName.endsWith(".mpeg4")
    );

    const jpgEntries = zipEntries.filter((entry) =>
      entry.entryName.endsWith(".jpg")
    );

    if (!mpegFileEntry) {
      return res
        .status(404)
        .json({ message: "MPEG4 file not found in the package" });
    }

    const mpegData = mpegFileEntry.getData();

    const mpegStream = new Readable();
    mpegStream._read = () => {};
    mpegStream.push(mpegData);
    mpegStream.push(null);

    ffmpeg.setFfmpegPath(ffmpegPath);

    const convertedStream = new PassThrough();

    const files = jpgEntries.map((entry) => ({
      filename: entry.entryName,
      content: entry.getData().toString("base64"),
    }));

    let audioFile = "";

    return new Promise((resolve, reject) => {
      ffmpeg(mpegStream)
        .inputFormat("mp4")
        .outputFormat("mp3")
        .on("end", () => {
          console.log("Conversion finished");
          files.push({
            filename: mpegFileEntry.entryName.replace(".mpeg4", ".mp3"),
            content: audioFile,
          });
          if (!res.headersSent) {
            res.status(200).json({ files });
          }
          resolve(); // Resolve the promise once the response is sent
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          if (!res.headersSent) {
            res.status(500).json({ message: "Error during conversion" });
          }
          reject(err); // Reject the promise on error
        })
        .pipe(convertedStream);

      convertedStream.on("data", (chunk) => {
        audioFile += chunk.toString("base64");
      });

      convertedStream.on("error", (err) => {
        console.error("Streaming error:", err);
        if (!res.headersSent) {
          res.status(500).json({ message: "Error during streaming" });
        }
        reject(err); // Reject the promise on stream error
      });
    });
  } catch (error) {
    console.error("Error processing download package:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
