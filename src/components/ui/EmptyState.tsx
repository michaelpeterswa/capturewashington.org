export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="text-center py-20 px-6 text-muted-foreground">
      <h2 className="font-display text-2xl font-normal italic mb-3 text-foreground">
        {title}
      </h2>
      <p className="text-base max-w-sm mx-auto leading-normal">{message}</p>
    </div>
  );
}
