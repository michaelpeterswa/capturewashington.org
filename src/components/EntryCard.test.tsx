import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntryCard } from "./EntryCard";
import type { EntryListItem } from "@/types";

const mockEntry: EntryListItem = {
  id: "1",
  title: "Old City Hall",
  slug: "old-city-hall-abc1234",
  locationName: "Spokane, WA",
  lat: 47.6588,
  lng: -117.426,
  capturedAt: "2024-03-15T00:00:00Z",
  thumbnailUrl: "https://media.example.com/thumb.jpg",
  tags: [
    { id: "t1", name: "Art Deco" },
    { id: "t2", name: "Spokane" },
  ],
};

describe("EntryCard", () => {
  it("renders the entry title", () => {
    render(<EntryCard entry={mockEntry} />);
    expect(screen.getByText("Old City Hall")).toBeInTheDocument();
  });

  it("renders the location name", () => {
    render(<EntryCard entry={mockEntry} />);
    expect(screen.getByText("Spokane, WA")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<EntryCard entry={mockEntry} />);
    expect(screen.getByText("Art Deco")).toBeInTheDocument();
    expect(screen.getByText("Spokane")).toBeInTheDocument();
  });

  it("links to the entry detail page", () => {
    render(<EntryCard entry={mockEntry} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/entry/old-city-hall-abc1234");
  });

  it("shows placeholder when no thumbnail", () => {
    const noThumb = { ...mockEntry, thumbnailUrl: null };
    render(<EntryCard entry={noThumb} />);
    expect(screen.getByLabelText("No image available")).toBeInTheDocument();
  });

  it("renders a formatted date", () => {
    render(<EntryCard entry={mockEntry} />);
    const timeEl = document.querySelector("time");
    expect(timeEl).toBeInTheDocument();
    expect(timeEl?.getAttribute("datetime")).toBe("2024-03-15T00:00:00Z");
  });
});
