import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { domainname, username, password } = req.body;
    const apiBaseUrl = req.headers["x-custom-url"];

    try {
      // Refresh sign in using the external API
      const response = await axios.post(
        `${apiBaseUrl}SignIn`,
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

      res.status(200).json({ token });
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
