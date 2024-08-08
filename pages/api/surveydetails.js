// pages/api/surveydetails.js
import axios from "axios";
import config from "@/components/Config";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const  token  = req.headers["authorization"];
    const { surveyId } = req.query;
    

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const response = await axios.get(
        `${config.apiBaseUrl}Surveys/${surveyId}/GeneralSettings`,
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
        "Error fetching survey details:",
        error.response ? error.response.data : error.message
      );
      res.status(500).json({ error: "Error fetching survey details" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}