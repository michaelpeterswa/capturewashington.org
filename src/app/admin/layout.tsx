import { redirect } from "next/navigation";
import { auth, isAdmin, signIn } from "@/lib/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h1 className="font-display text-2xl font-normal mb-4">
          Admin Sign In
        </h1>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <Button type="submit">Sign in with Google</Button>
        </form>
      </main>
    );
  }

  if (!session.user?.role || !isAdmin(session.user.role)) {
    redirect("/");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 52)",
        } as React.CSSProperties
      }
    >
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
