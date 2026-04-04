import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";
import { EntryStatus } from "@/types";

describe("StatusBadge", () => {
  it("renders Draft label", () => {
    render(<StatusBadge status={EntryStatus.DRAFT} />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("renders Published label", () => {
    render(<StatusBadge status={EntryStatus.PUBLISHED} />);
    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("renders Archived label", () => {
    render(<StatusBadge status={EntryStatus.ARCHIVED} />);
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });
});
