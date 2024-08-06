import axios from "axios";
import config from "@/components/Config";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { surveyId } = req.query;
    const { authorization } = req.headers;

    if (!authorization || !surveyId) {
      return res.status(400).json({ error: "Missing token or surveyId" });
    }

    try {
      const qualityResponse = await axios.get(
        `${config.apiBaseUrl}Surveys/${surveyId}/InterviewQuality`,
        {
          headers: {
            Authorization: authorization,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json(qualityResponse.data);
    } catch (error) {
      console.error("Error fetching interview quality data:", error);
      res.status(500).json({ error: "Error fetching interview quality data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
