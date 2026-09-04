// src/components/modeButton.ts

import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

interface ThemeSwitchButtonProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const ThemeSwitchButton: React.FC<ThemeSwitchButtonProps> = ({
  theme,
  toggleTheme,
}) => {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="bg-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
