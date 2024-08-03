// Purpose: Refresh the token when it expires.
import axios from "axios";

const refreshToken = async () => {
  const domainname = localStorage.getItem("domainname");
  const username = localStorage.getItem("username");
  const password = localStorage.getItem("password");

  if (!domainname || !username || !password) {
    console.error("Missing credentials for token refresh");
    return;
  }

  try {
    const response = await axios.post("/api/signin", {
      domainname,
      username,
      password,
    });
    const newToken = response.data.token;
    localStorage.setItem("token", newToken);
  } catch (error) {
    console.error("Error refreshing token:", error);
  }
};

export default refreshToken;
