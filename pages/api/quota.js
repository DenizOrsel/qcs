import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const token = req.headers["authorization"];
    const apiBaseUrl = req.headers["x-custom-url"];
    const { surveyId } = req.query;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const response = await axios.get(
        `${apiBaseUrl}Surveys/${surveyId}/SurveyQuotaFrame`,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json(response.data);
    } catch (error) {
      console.error(
        "Error fetching quota frame:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ error: "Error fetching quota frame" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
