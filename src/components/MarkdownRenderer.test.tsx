import { describe, it, expect } from "vitest";
import { renderMarkdown } from "@/lib/markdown";

// MarkdownRenderer is an async server component which cannot be tested
// directly with React Testing Library in jsdom. We test the underlying
// renderMarkdown function instead (the component is a thin wrapper).
describe("MarkdownRenderer (via renderMarkdown)", () => {
  it("renders heading HTML", async () => {
    const html = await renderMarkdown("# Title");
    expect(html).toContain("<h1>Title</h1>");
  });

  it("renders paragraph with inline formatting", async () => {
    const html = await renderMarkdown("This is *italic* and **bold**.");
    expect(html).toContain("<em>italic</em>");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("renders links with href", async () => {
    const html = await renderMarkdown("[click](https://example.com)");
    expect(html).toContain('href="https://example.com"');
  });
});
