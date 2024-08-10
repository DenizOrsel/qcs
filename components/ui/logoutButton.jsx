import React from 'react'
import { Button } from './button'
import { useRouter } from 'next/router'


const LogoutButton = () => {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      onClick={() => {
        localStorage.removeItem("token");
        localStorage.removeItem("domainname");
        localStorage.removeItem("username");
        localStorage.removeItem("password");
        router.push("/");
      }}
      className="mt-4 p-2 mr-2"
      style={{ float: "right" }}
      size="icon"
    >
      <LogOutIcon className="h-5 w-5" />
      <span className="sr-only">Logout</span>
    </Button>
  );
}

export default LogoutButton

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