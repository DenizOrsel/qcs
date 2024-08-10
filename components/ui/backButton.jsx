import React from 'react'
import { Button } from './button'
import { useRouter } from 'next/router'

const BackButton = (props) => {
    const router = useRouter()
  return (
    <Button
      onClick={() => router.push(props.href)}
      className="ml-2"
      variant="ghost"
      size="icon"
    >
      <ArrowLeftIcon className="h-5 w-5" />
      <span className="sr-only">Back</span>
    </Button>
  );
}

export default BackButton


function ArrowLeftIcon(props) {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}