import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import ProtectedRoute from "../components/ProtectedRoute";
import Surveylist from "@/components/component/surveylist";
import LogoutButton from "@/components/ui/LogoutButton";
import { AppContext } from "@/context/AppContext";

export default function Dashboard() {
  const { region, domainname, dbConfig } = useContext(AppContext);
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

  useEffect(() => {
    if (!region || !domainname) {
      router.push("/login");
    }
  }, [region, domainname, router]);

  if (!auth) return null;

  return (
    <ProtectedRoute>
      <Surveylist region={region} domainname={domainname} dbConfig={dbConfig} />
    </ProtectedRoute>
  );
}
