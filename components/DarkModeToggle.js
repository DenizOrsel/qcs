import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (
      theme === "dark" ||
      (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
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
    <div className="flex justify-end items-end absolute right-0 bottom-0 mr-4 mb-4 z-50">
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
            <SunIcon className="text-white" />
          ) : (
            <MoonIcon className="text-gray-700" />
          )}
        </span>
      </button>
    </div>
  );
}
