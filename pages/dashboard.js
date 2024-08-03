import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";
import Surveylist from "@/components/component/surveylist";
import refreshToken from "@/components/RefreshToken";

export default function Dashboard() {
  const [auth, setAuth] = useState(false);
  const router = useRouter();

      useEffect(() => {
        refreshToken();
        const interval = setInterval(() => {
          refreshToken();
        }, 300000);
        return () => clearInterval(interval);
      }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setAuth(true);
    }
  }, []);

  if (!auth) return null;

  return (
    <ProtectedRoute>
      <div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("domainname");
            localStorage.removeItem("username");
            localStorage.removeItem("password");
            router.push("/");
          }}
          className="mt-4 bg-red-500 p-2 rounded text-white"
        >
          Logout
        </button>
        <Surveylist />
      </div>
    </ProtectedRoute>
  );
}
