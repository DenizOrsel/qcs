import axios from "axios";
import sql from "mssql";
import { getDbConnection } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    console.log("Method not allowed");
    return;
  }

  const token = req.headers["authorization"];
  const apiBaseUrl = req.headers["x-custom-url"];
  const { interviewId, surveyId } = req.query;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!interviewId || !surveyId) {
    return res
      .status(400)
      .json({ error: "InterviewId and SurveyId are required" });
  }

  try {
    // Fetch InterviewQuality from Nfield API
    const nfieldResponse = await axios.get(
      `${apiBaseUrl}Surveys/${surveyId}/InterviewQuality/${interviewId}`,
      {
        headers: {
          Authorization: `Basic ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const interviewQuality = nfieldResponse.data.InterviewQuality;

    try {
      // Connect to the database and fetch interview details
      const pool = await getDbConnection();
      const request = pool.request();
      request.input("interviewId", sql.Int, interviewId);
      request.input("surveyId", sql.UniqueIdentifier, surveyId);

      const query = `
        SELECT 
          i.NfieldInterviewId AS InterviewNumber,
          s.Name AS SurveyName,
          im.Value AS InterviewerId,
          i.ActiveSeconds,
          ci.Value AS ClientInformation,
          li.Value AS LocationInfo
        FROM dbo.Interviews i
        JOIN dbo.Surveys s ON i.SurveyId = s.Id
        JOIN dbo.InterviewMetadata im 
            ON i.Id = im.InterviewId 
            AND im.[Key] = 'InterviewerId'
        LEFT JOIN dbo.InterviewMetadata ci 
            ON i.Id = ci.InterviewId 
            AND ci.[Key] = 'ClientInformation'
        LEFT JOIN dbo.InterviewMetadata li 
            ON i.Id = li.InterviewId 
            AND li.[Key] = 'Locationinfo'
        WHERE i.NfieldInterviewId = @interviewId 
        AND s.NfieldSurveyId = @surveyId
      `;

      const result = await request.query(query);

      if (result.recordset.length === 0) {
        return res.status(404).json({ error: "Interview not found" });
      }

      const interviewDetails = {
        ...result.recordset[0],
        InterviewQuality: interviewQuality,
      };

      res.status(200).json(interviewDetails);
    } catch (dbError) {
      console.error("Database error:", dbError);
      res.status(500).json({ error: "Database error" });
    }
  } catch (apiError) {
    console.error("Error fetching data from Nfield API:", apiError);
    res.status(500).json({ error: "Error fetching data from external API" });
  }
}
