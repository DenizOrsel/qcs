import React from "react";
import { Button } from "@/components/ui/button";
import axios from "axios"; 
import { useRouter } from "next/router";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
     
      await axios.post("/api/logout");

      
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("domainname");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("password");

      
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout} 
      className="mt-4 p-2 mr-2"
      style={{ float: "right" }}
      size="icon"
    >
      <LogOutIcon className="h-5 w-5" />
      <span className="sr-only">Logout</span>
    </Button>
  );
};

export default LogoutButton;

function LogOutIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}