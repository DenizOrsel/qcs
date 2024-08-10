import React from 'react'
import { Button } from '../ui/button';
import Router from 'next/router';

const Error = (props) => {
return (
  <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-md text-center">
      <div className="mt-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white dark:text-white sm:text-4xl">
          Oops, something went wrong!
        </h1>
        <p className="text-muted-foreground dark:text-card-foreground">
          We are sorry, but we had an {props.error}.
        </p>
        <Button onClick={() => Router.push("/dashboard")} className="mt-4">BACK</Button>
      </div>
    </div>
  </div>
);
}

export default Error