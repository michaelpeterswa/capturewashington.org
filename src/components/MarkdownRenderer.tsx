import { renderMarkdown } from "@/lib/markdown";

/**
 * Server Component that renders markdown to sanitized HTML.
 * Content is sanitized by rehype-sanitize in the markdown pipeline
 * before being injected — this is safe for user-authored markdown.
 */
export async function MarkdownRenderer({ content }: { content: string }) {
  const html = await renderMarkdown(content);
  return (
    <div
      className="prose"
      style={{
        maxWidth: "var(--max-width-prose)",
        lineHeight: "var(--leading-relaxed)",
        fontSize: "var(--text-base)",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
