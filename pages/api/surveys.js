import axios from "axios";
import config from "@/components/Config";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Fetch surveys
      const surveysResponse = await axios.get(
        `${config.apiBaseUrl}Surveys`,
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const surveys = surveysResponse.data;

      
      const nonBlueprintBasicSurveys = surveys.filter(
        (survey) => !survey.IsBlueprint && survey.SurveyType === "Basic"
      );

      // Fetch interview quality data for each non-blueprint survey
      const surveysWithAdditionalData = await Promise.all(
        nonBlueprintBasicSurveys.map(async (survey) => {
          try {
            const [qualityResponse] = await Promise.all([
              axios.get(
                `${config.apiBaseUrl}Surveys/${survey.SurveyId}/InterviewQuality`,
                {
                  headers: {
                    Authorization: `Basic ${token}`,
                    "Content-Type": "application/json",
                  },
                }
              ),
            ]);

            const interviewQualityCounts = qualityResponse.data.reduce(
              (acc, item) => {
                acc[item.InterviewQuality] =
                  (acc[item.InterviewQuality] || 0) + 1;
                return acc;
              },
              { 0: 0, 1: 0, 2: 0, 3: 0 }
            );

            return {
              ...survey,
              InterviewQualityCounts: interviewQualityCounts,
            };
          } catch (error) {
            console.error(
              `Error fetching data for survey ${survey.SurveyId}:`,
              error
            );
            return {
              ...survey,
              InterviewQualityCounts: { 0: null, 1: null, 2: null, 3: null },
            };
          }
        })
      );

      res.status(200).json(surveysWithAdditionalData);
    } catch (error) {
      console.error(
        "Error fetching surveys:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ error: "Error fetching surveys" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
