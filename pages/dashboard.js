import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";
import Surveylist from "@/components/component/surveylist";
import refreshToken from "@/components/RefreshToken";
import LogoutButton from "@/components/ui/LogoutButton";

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
        <LogoutButton />
        <Surveylist />
      </div>
    </ProtectedRoute>
  );
}