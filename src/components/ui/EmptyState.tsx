export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "var(--space-16) var(--space-6)",
        color: "var(--color-text-secondary)",
      }}
    >
      <h2
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: "var(--font-semibold)",
          marginBottom: "var(--space-2)",
          color: "var(--color-text)",
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: "var(--text-base)" }}>{message}</p>
    </div>
  );
}
