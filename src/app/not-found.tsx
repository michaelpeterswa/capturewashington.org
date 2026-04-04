import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "var(--space-6)",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "var(--text-4xl)",
          fontWeight: "var(--font-bold)",
          marginBottom: "var(--space-2)",
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: "var(--text-lg)",
          color: "var(--color-text-secondary)",
          marginBottom: "var(--space-6)",
        }}
      >
        This page could not be found.
      </p>
      <Link
        href="/"
        style={{
          padding: "var(--space-2) var(--space-6)",
          backgroundColor: "var(--color-primary)",
          color: "white",
          borderRadius: "var(--radius-md)",
          textDecoration: "none",
          fontSize: "var(--text-base)",
          fontWeight: "var(--font-medium)",
        }}
      >
        Back to Timeline
      </Link>
    </main>
  );
}
