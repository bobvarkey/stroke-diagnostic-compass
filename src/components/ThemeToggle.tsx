import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Dark-first app: html.dark is the default so Tailwind dark: variants match the dark shell.
    // Only "light" in localStorage removes the class.
    const stored = localStorage.getItem("theme");
    const isDarkMode = stored === "light" ? false : true;
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="h-10 w-10 rounded-full border-2 border-primary/20 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 shadow-lg"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-500 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-primary transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  );
}
