"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  return (
    <span
      className="inline-flex items-center justify-center cursor-pointer select-none p-2 rounded hover:bg-muted transition-colors"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      tabIndex={0}
      role="button"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <Sun className="h-[1.5rem] w-[1.3rem] text-amber-500 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block text-amber-400" />
      <span className="sr-only">Toggle theme</span>
    </span>
  )
}
