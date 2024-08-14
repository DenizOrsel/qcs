import axios from "axios";
import sql from "mssql";
import { getDbConnection } from "@/lib/db"; // Assuming this function exists in your project

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { token } = req.headers;
    const apiBaseUrl = req.headers["x-custom-url"];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Step 1: Fetch surveys from the external API
      const surveysResponse = await axios.get(`${apiBaseUrl}Surveys`, {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      });

      const surveys = surveysResponse.data;

      // Step 2: Establish connection to the SQL database
      const pool = await getDbConnection();
      const request = pool.request();

      // Step 3: Query the SQL database to get NfieldSurveyId values
      const sqlQuery = `
        SELECT 
          Id AS SurveyId, 
          NfieldSurveyId 
        FROM dbo.Surveys
      `;
      const result = await request.query(sqlQuery);

      const sqlSurveys = result.recordset;

      // Step 4: Compare SurveyId from API with NfieldSurveyId from SQL and filter matching surveys
      const matchingSurveys = surveys.filter((survey) =>
        sqlSurveys.some(
          (sqlSurvey) => sqlSurvey.NfieldSurveyId === survey.SurveyId
        )
      );

      // Step 5: Further filter to include only non-blueprint basic surveys
      const nonBlueprintBasicSurveys = matchingSurveys.filter(
        (survey) => !survey.IsBlueprint && survey.SurveyType === "Basic"
      );

      // Step 6: Fetch interview quality data for each non-blueprint survey
      const surveysWithAdditionalData = await Promise.all(
        nonBlueprintBasicSurveys.map(async (survey) => {
          try {
            const qualityResponse = await axios.get(
              `${apiBaseUrl}Surveys/${survey.SurveyId}/InterviewQuality`,
              {
                headers: {
                  Authorization: `Basic ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

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

      // Step 7: Send the response with the processed data
      res.status(200).json(surveysWithAdditionalData);
    } catch (error) {
      console.error(
        "Error fetching or processing surveys:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ error: "Error fetching or processing surveys" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
