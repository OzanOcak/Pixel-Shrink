// src/components/mainLayout.ts

import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import useStore from "@/store/useAppStore";
import { ThemeSwitchButton } from "./modebutton";

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    console.log("Theme changed:", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleInfoClick = () => {
    navigate("/info");
  };

  return (
    <div className="flex flex-col h-screen">
      {/*<header className="flex justify-center items-center bg-gray-300 dark:bg-black h-12 py-1 px-6">
        <div className="mx-auto">
          <h1 className="text-2xl font-semibold text-black dark:text-white ">
            Pixel Shrink
          </h1>
        </div>
        <ThemeSwitchButton theme={theme} toggleTheme={toggleTheme} />
      </header>*/}

      <main className="flex-grow py-0 px-6 overflow-hidden">
        <Outlet />
      </main>

      <footer className="flex justify-center items-center bg-gray-300 dark:bg-black h-10 py-1 px-6 text-center">
        <button
          onClick={handleInfoClick}
          className="text-black hover:text-gray-400 transition-transform duration-300 hover:scale-110 active:text-blue-800 active:scale-85"
        >
          <Info className="h-6 w-6 mr-4 text:black dark:text-white" />
        </button>
        <ThemeSwitchButton theme={theme} toggleTheme={toggleTheme} />
        <div className="mx-auto">
          <p>&copy; {new Date().getFullYear()} Pixel Shrink</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
