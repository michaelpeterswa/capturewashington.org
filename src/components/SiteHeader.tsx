"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Timeline" },
  { href: "/map", label: "Map" },
  { href: "/search", label: "Search" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-t-2 border-accent bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="font-display text-2xl font-normal text-foreground tracking-tight">
            Capture Washington
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:ml-auto">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-1.5 text-sm tracking-wide uppercase transition-colors",
                  isActive
                    ? "text-foreground font-medium after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:bg-accent after:rounded-full"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="w-px h-5 bg-border mx-1" />
          <ThemeToggle />
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="h-px bg-border" />
      </div>
    </header>
  );
}
