import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";

const Toaster = ({ message, visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <Card className="p-4 bg-blue-900 text-white">{message}</Card>
    </div>
  );
};

export default Toaster;
