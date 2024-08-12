// Middleware to refresh the token when it expires
import axios from "axios";

export async function signIn() {
  const domainname = sessionStorage.getItem("domainname");
  const username = sessionStorage.getItem("username");
  const password = sessionStorage.getItem("password");
  const apiBaseUrl = localStorage.getItem("apiBaseUrl");

  if (!domainname || !username || !password) {
    console.error("Missing credentials for token refresh");
    return;
  }

  try {
    const response = await axios.post(
      "/api/signin",
      {
        domainname,
        username,
        password,
      },
      {
        headers: {
          "x-custom-url": apiBaseUrl,
        },
      }
    );
    const newToken = response.data.token;
    sessionStorage.setItem("token", newToken);
    return newToken;
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};

