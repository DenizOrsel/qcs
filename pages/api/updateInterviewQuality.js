import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const token = req.headers["authorization"];
    const apiBaseUrl = req.headers["x-custom-url"];
    const { surveyId, interviewId, newState } = req.body;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const response = await axios.put(
        `${apiBaseUrl}Surveys/${surveyId}/InterviewQuality`,
        {
          InterviewId: interviewId,
          NewState: newState,
        },
        {
          headers: {
            Authorization: `Basic ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Error updating interview quality:", error);
      res.status(500).json({ error: "Error updating interview quality" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
