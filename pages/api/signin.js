import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { domainname, username, password } = req.body;

    try {
      const response = await axios.post(
        "https://api.nfieldmr.com/v1/SignIn",
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
      console.log(token); // Corrected log
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
      console.error(
        "Invalid credentials:",
        error.response ? error.response.data : error.message
      ); // Improved error logging
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
    console.log("Method not allowed");
  }
}
