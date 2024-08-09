import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";
import Surveylist from "@/components/component/surveylist";
import refreshToken from "@/components/RefreshToken";
import { Button } from "@/components/ui/button";

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
  }, [router]);

  if (!auth) return null;

  return (
    <ProtectedRoute>
      <div>
        <Button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("domainname");
            localStorage.removeItem("username");
            localStorage.removeItem("password");
            router.push("/");
          }}
          className="mt-4 p-2 mr-2"
          style={{ float: "right" }}
        >
          Logout
        </Button>
        <Surveylist />
      </div>
    </ProtectedRoute>
  );
}
