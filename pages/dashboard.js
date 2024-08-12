import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";
import Surveylist from "@/components/component/surveylist";
import LogoutButton from "@/components/ui/LogoutButton";

export default function Dashboard() {
  const [auth, setAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setAuth(true);
    }
  }, [router]);

  if (!auth) return null;

  return (
    <ProtectedRoute>
        <LogoutButton />
        <Surveylist />
    </ProtectedRoute>
  );
}