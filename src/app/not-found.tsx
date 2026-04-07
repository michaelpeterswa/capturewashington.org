import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <p className="font-display text-[8rem] font-normal italic leading-none text-border tracking-tighter mb-4">
        404
      </p>
      <h1 className="font-display text-2xl font-normal mb-2">Page not found</h1>
      <p className="text-base text-muted-foreground mb-8 max-w-xs leading-normal">
        The building you&apos;re looking for may have been moved or demolished.
      </p>
      <Link href="/" className={buttonVariants()}>
        Back to Timeline
      </Link>
    </main>
  );
}
