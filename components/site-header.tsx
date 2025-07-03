import Link from "next/link"

import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.firecracker className="h-8 w-8 text-amber-500" />
          <span className="font-bold text-amber-500 text-base flex items-center">FireCracker</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
