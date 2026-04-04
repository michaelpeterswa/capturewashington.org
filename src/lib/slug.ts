import { createId } from "@paralleldrive/cuid2";

export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const suffix = createId().slice(0, 7);
  return base ? `${base}-${suffix}` : suffix;
}
