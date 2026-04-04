export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/StatusBadge";
import { EntryStatus } from "@/types";
import Link from "next/link";

export default async function AdminDashboard() {
  const entries = await prisma.entry.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: { media: { take: 1 } },
  });

  return (
    <main
      style={{
        maxWidth: "var(--max-width-content)",
        margin: "0 auto",
        padding: "var(--space-6)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-6)",
        }}
      >
        <h1
          style={{
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-bold)",
          }}
        >
          Admin Dashboard
        </h1>
        <Link
          href="/admin/new"
          style={{
            padding: "var(--space-2) var(--space-4)",
            backgroundColor: "var(--color-primary)",
            color: "white",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-medium)",
          }}
        >
          + New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>
          No entries yet. Create your first one.
        </p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "var(--text-sm)",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "2px solid var(--color-border)",
                textAlign: "left",
              }}
            >
              <th style={{ padding: "var(--space-2) var(--space-3)" }}>
                Title
              </th>
              <th style={{ padding: "var(--space-2) var(--space-3)" }}>
                Status
              </th>
              <th style={{ padding: "var(--space-2) var(--space-3)" }}>
                Updated
              </th>
              <th style={{ padding: "var(--space-2) var(--space-3)" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                style={{
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <td style={{ padding: "var(--space-3)" }}>{entry.title}</td>
                <td style={{ padding: "var(--space-3)" }}>
                  <StatusBadge status={entry.status as EntryStatus} />
                </td>
                <td
                  style={{
                    padding: "var(--space-3)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {entry.updatedAt.toLocaleDateString()}
                </td>
                <td style={{ padding: "var(--space-3)" }}>
                  <Link
                    href={`/admin/entry/${entry.id}/edit`}
                    style={{
                      color: "var(--color-primary)",
                      textDecoration: "none",
                    }}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
