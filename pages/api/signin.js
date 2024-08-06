import axios from "axios";
import { getDbConnection } from "@/lib/db";
import config from "@/components/Config";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { domainname, username, password } = req.body;

    try {
      // Sign in using the external API
      const response = await axios.post(
        `${config.apiBaseUrl}SignIn`,
        {
          Domain: domainname,
          Username: username,
          Password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const token = response.data.AuthenticationToken;

      // Connect to the SQL database
      try {
        const pool = await getDbConnection();

        // Optional: Perform any database operations needed during login

        // Return the token and a successful login response
        res.status(200).json({ token });
      } catch (dbError) {
        console.error("Database connection error:", dbError);
        res.status(500).json({ error: "Database connection error" });
      }
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
      console.error(
        "Invalid credentials:",
        error.response ? error.response.data : error.message
      );
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
    console.log("Method not allowed");
  }
}
