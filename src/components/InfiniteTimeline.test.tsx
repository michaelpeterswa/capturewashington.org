import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfiniteTimeline } from "./InfiniteTimeline";
import type { EntryListItem } from "@/types";

const mockEntries: EntryListItem[] = [
  {
    id: "1",
    title: "Building One",
    slug: "building-one-abc1234",
    locationName: "Seattle, WA",
    lat: 47.6,
    lng: -122.33,
    capturedAt: "2024-06-01T00:00:00Z",
    thumbnailUrl: null,
    tags: [],
  },
  {
    id: "2",
    title: "Building Two",
    slug: "building-two-def5678",
    locationName: "Tacoma, WA",
    lat: 47.25,
    lng: -122.44,
    capturedAt: "2024-05-01T00:00:00Z",
    thumbnailUrl: null,
    tags: [],
  },
];

describe("InfiniteTimeline", () => {
  it("renders all initial entries", () => {
    render(
      <InfiniteTimeline initialEntries={mockEntries} initialCursor={null} />,
    );
    expect(screen.getByText("Building One")).toBeInTheDocument();
    expect(screen.getByText("Building Two")).toBeInTheDocument();
  });

  it("does not render loading sentinel when no more pages", () => {
    render(
      <InfiniteTimeline initialEntries={mockEntries} initialCursor={null} />,
    );
    expect(screen.queryByText("Loading more...")).not.toBeInTheDocument();
  });
});
