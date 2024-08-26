import sql from "mssql";
import { getTargetDbConnection } from "@/lib/answersDb";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { surveyId, interviewId } = req.query;
    const dbserver = req.headers["x-db-server"];
    const dbdatabase = req.headers["x-db-database"];
    const dbuser = req.headers["x-db-user"];
    const dbpassword = req.headers["x-db-password"];

    if (!surveyId) {
      return res.status(400).json({ error: "SurveyId is required" });
    }
    let pool;
    try {
      pool = await getTargetDbConnection({
        dbserver,
        dbdatabase,
        dbuser,
        dbpassword,
      });
      const request = pool.request();
      request.input("surveyId", sql.UniqueIdentifier, surveyId);

      let query = `
        SELECT 
  a.Id AS AnswerId,
  a.AlphaValue,
  a.InterviewId,
  a.NumericValue,
  a.QuestionId,
  a.CategoryValueId,
  q.[Text] AS QuestionText,
  q.NfieldQuestionId,
  i.Id AS InterviewId,
  i.SampleDataRecordId,
  i.EndTime,
  i.StartTime,
  i.[Status],
  i.Successful,
  i.ResponseCode,
  i.ProcessTime,
  i.LastUpdated,
  i.NfieldInterviewId,
  i.ActiveSeconds,
  i.Final,
  i.Test,
  i.CalculatedResult,
  qc.[Value] AS CategoryValueText,
  STRING_AGG(cli.Label, ', ') AS ContextLabel
FROM dbo.Answers a
JOIN dbo.Questions q ON a.QuestionId = q.Id
JOIN dbo.Interviews i ON a.InterviewId = i.SampleDataRecordId
JOIN dbo.Surveys s ON q.SurveyId = s.Id
LEFT JOIN dbo.QuestionCategories qc ON a.CategoryValueId = qc.Id
LEFT JOIN dbo.QuestionContextLists qcl ON q.Id = qcl.QuestionId
LEFT JOIN dbo.ContextListItems cli ON qcl.ContextListId = cli.ContextListId
 WHERE s.NfieldSurveyId = @surveyId
      `;

      if (interviewId) {
        request.input("interviewId", sql.Int, interviewId);
        query += ` AND i.NfieldInterviewId = @interviewId`;
      }

      query += `
      GROUP BY 
  a.Id,
  a.AlphaValue,
  a.InterviewId,
  a.NumericValue,
  a.QuestionId,
  a.CategoryValueId,
  q.[Text],
  q.NfieldQuestionId,
  i.Id,
  i.SampleDataRecordId,
  i.EndTime,
  i.StartTime,
  i.[Status],
  i.Successful,
  i.ResponseCode,
  i.ProcessTime,
  i.LastUpdated,
  i.NfieldInterviewId,
  i.ActiveSeconds,
  i.Final,
  i.Test,
  i.CalculatedResult,
  qc.[Value];
      `;

      const result = await request.query(query);

      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching answers:", error);
      res.status(500).json({ error: "Error fetching answers" });
    } finally {
      if (pool) pool.close(); // Ensure connection is closed
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
