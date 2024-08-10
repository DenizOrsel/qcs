import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(true); // Set initial state to true

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (
      theme === "light" || // Change to check for light theme
      (!theme && !window.matchMedia("(prefers-color-scheme: dark)").matches) // Invert this condition
    ) {
      document.documentElement.classList.remove("dark");
      setDarkMode(false); // Set darkMode to false when in light mode
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <div className="flex justify-end items-end absolute right-0 bottom-0 mr-4 mb-4 z-40">
      <button
        onClick={toggleDarkMode}
        className="flex items-center justify-center w-12 h-6 p-1 bg-gray-200 rounded-full dark:bg-gray-600 focus:outline-none"
      >
        <span
          className={`${
            darkMode ? "translate-x-4" : "-translate-x-4"
          } w-5 h-5 transform bg-gray-400 rounded-full transition-transform flex items-center justify-center`}
        >
          {darkMode ? (
            <MoonIcon className="text-gray-700" /> // Display MoonIcon in dark mode
          ) : (
            <SunIcon className="text-white" /> // Display SunIcon in light mode
          )}
        </span>
      </button>
    </div>
  );
}
