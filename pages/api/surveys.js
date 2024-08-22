import axios from "axios";
import { getTargetDbConnection } from "@/lib/targetDb";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { token } = req.headers;
    const apiBaseUrl = req.headers["x-custom-url"];
    const dbserver = req.headers["x-db-server"];
    const dbdatabase = req.headers["x-db-database"];
    const dbuser = req.headers["x-db-user"];
    const dbpassword = req.headers["x-db-password"];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let pool;
    try {
      const surveysResponse = await axios.get(`${apiBaseUrl}Surveys`, {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      });

      const surveys = surveysResponse.data;

      pool = await getTargetDbConnection({
        dbserver,
        dbdatabase,
        dbuser,
        dbpassword,
      });
      const request = pool.request();

      const sqlQuery = `
        SELECT 
          Id AS SurveyId, 
          NfieldSurveyId 
        FROM dbo.Surveys
      `;
      const result = await request.query(sqlQuery);

      const sqlSurveys = result.recordset;

      const matchingSurveys = surveys.filter((survey) =>
        sqlSurveys.some(
          (sqlSurvey) => sqlSurvey.NfieldSurveyId === survey.SurveyId
        )
      );

      const nonBlueprintBasicSurveys = matchingSurveys.filter(
        (survey) => !survey.IsBlueprint && survey.SurveyType === "Basic"
      );

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

      res.status(200).json(surveysWithAdditionalData);
    } catch (error) {
      console.error(
        "Error fetching or processing surveys:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ error: "Error fetching or processing surveys" });
    } finally {
      if (pool) pool.close(); // Ensure connection is closed
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
