"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "var(--space-2)",
        marginBottom: "var(--space-6)",
      }}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search historic buildings..."
        style={{
          flex: 1,
          padding: "var(--space-2) var(--space-4)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--text-base)",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "var(--space-2) var(--space-4)",
          backgroundColor: "var(--color-primary)",
          color: "white",
          border: "none",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          fontSize: "var(--text-base)",
          fontWeight: "var(--font-medium)",
        }}
      >
        Search
      </button>
    </form>
  );
}
