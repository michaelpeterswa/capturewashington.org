import { EntryStatus } from "@/types";

const statusStyles: Record<
  EntryStatus,
  { bg: string; color: string; label: string }
> = {
  [EntryStatus.DRAFT]: {
    bg: "var(--color-warning-light)",
    color: "var(--color-warning)",
    label: "Draft",
  },
  [EntryStatus.PUBLISHED]: {
    bg: "var(--color-success-light)",
    color: "var(--color-success)",
    label: "Published",
  },
  [EntryStatus.ARCHIVED]: {
    bg: "var(--color-bg-alt)",
    color: "var(--color-text-muted)",
    label: "Archived",
  },
};

export function StatusBadge({ status }: { status: EntryStatus }) {
  const style = statusStyles[status];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px var(--space-2)",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--font-medium)",
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  );
}
