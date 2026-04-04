import { searchEntries } from "@/lib/search";
import { EntryCard } from "@/components/EntryCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | Capture Washington",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const tagsParam = typeof params.tags === "string" ? params.tags : undefined;
  const tags = tagsParam ? tagsParam.split(",") : undefined;
  const dateFrom =
    typeof params.dateFrom === "string" ? params.dateFrom : undefined;
  const dateTo = typeof params.dateTo === "string" ? params.dateTo : undefined;

  const hasFilters = q || tags || dateFrom || dateTo;
  const results = hasFilters
    ? await searchEntries({ q, tags, dateFrom, dateTo })
    : null;

  return (
    <main
      style={{
        maxWidth: "var(--max-width-content)",
        margin: "0 auto",
        padding: "var(--space-6)",
      }}
    >
      <h1
        style={{
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--font-bold)",
          marginBottom: "var(--space-6)",
        }}
      >
        Search
      </h1>

      <SearchBar />

      {results && results.entries.length === 0 && (
        <EmptyState
          title="No results found"
          message="Try broadening your search or using different keywords."
        />
      )}

      {results && results.entries.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "var(--space-6)",
          }}
        >
          {results.entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {!hasFilters && (
        <EmptyState
          title="Search for buildings"
          message="Enter a keyword above to find historic buildings."
        />
      )}
    </main>
  );
}
