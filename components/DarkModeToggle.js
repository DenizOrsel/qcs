import { useEffect } from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { useDarkMode } from "@/context/DarkModeContext";

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (
      theme === "light" ||
      (!theme && !window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <div className="flex justify-end items-end fixed right-0 bottom-0 mr-4 mb-4 z-40">
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
            <MoonIcon className="text-gray-700" />
          ) : (
            <SunIcon className="text-white" />
          )}
        </span>
      </button>
    </div>
  );
}
