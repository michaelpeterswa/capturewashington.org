import { Button } from "@/components/ui/button";

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
    <div className="text-center py-16 px-6 bg-destructive/10 rounded-lg border border-destructive/20">
      <h2 className="text-xl font-semibold mb-2 text-destructive">{title}</h2>
      <p className="text-base text-muted-foreground mb-4">{message}</p>
      {retry && (
        <Button variant="destructive" size="sm" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}
