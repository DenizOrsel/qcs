import React from "react";
import { Button } from "./button";
import { Crosshair2Icon } from "@radix-ui/react-icons";

const QuotaButton = () => {
  return (
    <Button
      className="ml-2"
      variant="ghost"
      size="icon"
    >
      <Crosshair2Icon className="h-5 w-5" />
      <span className="sr-only">Quota</span>
    </Button>
  );
};

export default QuotaButton;
