export function Skeleton({
  width,
  height,
  className,
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        width: width ?? "100%",
        height: height ?? "1rem",
        backgroundColor: "var(--color-bg-alt)",
        borderRadius: "var(--radius-md)",
        animation: "pulse 2s ease-in-out infinite",
      }}
      aria-hidden="true"
    />
  );
}
