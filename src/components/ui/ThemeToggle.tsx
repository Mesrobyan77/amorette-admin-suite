import { useTheme } from "@/context/ThemeContext";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative h-10 w-10 rounded-xl border border-border bg-card hover:bg-muted transition flex items-center justify-center"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="inline-flex"
      >
        {theme === "dark" ? <Sun className="h-4 w-4 text-[var(--gold)]" /> : <Moon className="h-4 w-4" />}
      </motion.span>
    </button>
  );
}
