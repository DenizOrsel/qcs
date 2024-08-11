// Middleware to refresh the token when it expires
import axios from "axios";

export async function signIn() {
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
    return newToken;
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};

