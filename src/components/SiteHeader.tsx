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
    <header className="mx-auto max-w-7xl px-6 py-4 flex items-center">
      <Link
        href="/"
        className="font-display text-lg font-normal italic text-foreground whitespace-nowrap"
      >
        Capture Washington
      </Link>
      <div className="w-px h-5 bg-border mx-5" />
      <div className="flex items-center gap-1 ml-auto">
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
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                isActive
                  ? "text-foreground font-medium bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {link.label}
            </Link>
          );
        })}
        <ThemeToggle />
      </div>
    </header>
  );
}
