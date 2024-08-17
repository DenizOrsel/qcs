import axios from "axios";
import sql from "mssql";
import { getDbConnection } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { surveyId } = req.query;
    const { authorization } = req.headers;
    const apiBaseUrl = req.headers["x-custom-url"];

    if (!authorization || !surveyId) {
      return res.status(400).json({ error: "Missing token or surveyId" });
    }

    try {
      const qualityResponse = await axios.get(
        `${apiBaseUrl}Surveys/${surveyId}/InterviewQuality`,
        {
          headers: {
            Authorization: authorization,
            "Content-Type": "application/json",
          },
        }
      );

      const interviewData = qualityResponse.data;

      const interviewIds = interviewData.map((i) =>
        parseInt(i.Id, 10).toString()
      );
      const interviewIdsString = interviewIds.map((id) => `'${id}'`).join(", ");

      const pool = await getDbConnection();

      const request = pool.request();
      request.input("nfieldSurveyId", sql.UniqueIdentifier, surveyId);

      const sqlQuery = `
  SELECT 
    i.NfieldInterviewId, 
    i.ActiveSeconds, 
    i.StartTime, 
    i.EndTime 
  FROM dbo.Interviews i
  JOIN dbo.Surveys s ON i.SurveyId = s.Id
  WHERE s.NfieldSurveyId = @nfieldSurveyId
    AND i.NfieldInterviewId IN (${interviewIdsString})
  ORDER BY i.NfieldInterviewId ASC
`;

      const result = await request.query(sqlQuery);
      const interviewsData = result.recordset;

      // Merge the SQL data with the Nfield API data
      const mergedData = interviewData.map((interview) => {
        const match = interviewsData.find(
          (i) => i.NfieldInterviewId === parseInt(interview.Id, 10).toString()
        );
        return {
          ...interview,
          ActiveSeconds: match?.ActiveSeconds || null,
          StartTime: match?.StartTime || null,
          EndTime: match?.EndTime || null,
        };
      });

      res.status(200).json(mergedData);
    } catch (error) {
      console.error("Error fetching interview quality data:", error);
      res.status(500).json({ error: "Error fetching interview quality data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
