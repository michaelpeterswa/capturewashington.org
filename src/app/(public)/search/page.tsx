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
    <main className="max-w-5xl mx-auto px-6 pt-8 pb-12">
      <h1 className="font-display text-3xl font-normal mb-6">Search</h1>

      <SearchBar />

      {results && results.entries.length === 0 && (
        <EmptyState
          title="No results found"
          message="Try broadening your search or using different keywords."
        />
      )}

      {results && results.entries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}

      {!hasFilters && (
        <EmptyState
          title="Search for buildings"
          message="Enter a keyword above to find historic buildings across Washington."
        />
      )}
    </main>
  );
}
