export function ErrorState({
  title = "Something went wrong",
  message,
  retry,
}: {
  title?: string;
  message: string;
  retry?: () => void;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "var(--space-16) var(--space-6)",
        backgroundColor: "var(--color-error-light)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-error)",
      }}
    >
      <h2
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: "var(--font-semibold)",
          marginBottom: "var(--space-2)",
          color: "var(--color-error)",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontSize: "var(--text-base)",
          color: "var(--color-text-secondary)",
          marginBottom: retry ? "var(--space-4)" : undefined,
        }}
      >
        {message}
      </p>
      {retry && (
        <button
          onClick={retry}
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "var(--color-error)",
            color: "white",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-medium)",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
