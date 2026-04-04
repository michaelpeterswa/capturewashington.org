import { describe, it, expect } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders a heading", async () => {
    const html = await renderMarkdown("# Hello");
    expect(html).toContain("<h1>Hello</h1>");
  });

  it("renders a paragraph with bold text", async () => {
    const html = await renderMarkdown("This is **bold** text.");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("renders a link", async () => {
    const html = await renderMarkdown("[Example](https://example.com)");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("Example");
  });

  it("sanitizes script tags", async () => {
    const html = await renderMarkdown(
      'Hello <script>alert("xss")</script> world',
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("Hello");
  });

  it("returns empty string for empty input", async () => {
    const html = await renderMarkdown("");
    expect(html).toBe("");
  });
});
