import { redirect } from "next/navigation";
import { auth, isAdmin, signIn } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
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
            fontSize: "var(--text-2xl)",
            fontWeight: "var(--font-bold)",
            marginBottom: "var(--space-4)",
          }}
        >
          Admin Sign In
        </h1>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <button
            type="submit"
            style={{
              padding: "var(--space-3) var(--space-6)",
              backgroundColor: "var(--color-primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--text-base)",
              fontWeight: "var(--font-medium)",
              cursor: "pointer",
            }}
          >
            Sign in with Google
          </button>
        </form>
      </main>
    );
  }

  if (!session.user?.role || !isAdmin(session.user.role)) {
    redirect("/");
  }

  return <>{children}</>;
}
