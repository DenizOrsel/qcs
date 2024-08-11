// components/TokenRefresher.js
import { useEffect } from "react";
import { signIn } from "@/lib/auth";

export default function TokenRefresher() {
  useEffect(() => {
    const refreshToken = async () => {
      const token = await signIn();
        if (!token) {
            console.error("Error refreshing token");
        }
    };
    refreshToken();
    const intervalId = setInterval(refreshToken, 300000);
    return () => clearInterval(intervalId);
  }, []);

  return null;
}
