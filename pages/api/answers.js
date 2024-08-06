import sql from "mssql";
import { getDbConnection } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { surveyId } = req.query;

    if (!surveyId) {
      return res.status(400).json({ error: "SurveyId is required" });
    }

    try {
      const pool = await getDbConnection();
      const request = pool.request();
      request.input("surveyId", sql.UniqueIdentifier, surveyId);

      const result = await request.query(`
        SELECT 
          a.Id, 
          a.AlphaValue, 
          a.InterviewId, 
          a.NumericValue, 
          a.QuestionId, 
          a.CategoryValueId,
          q.Text AS QuestionText
        FROM dbo.Answers a
        JOIN dbo.Questions q ON a.QuestionId = q.Id
        JOIN dbo.Surveys s ON q.SurveyId = s.Id
        WHERE s.NfieldSurveyId = @surveyId
      `);

      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ error: "Error fetching answers" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
    console.log("Method not allowed");
  }
}
