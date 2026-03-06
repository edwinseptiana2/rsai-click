import {
  createFileRoute,
  redirect,
  Outlet,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { getSession } from "@/server/auth";
import { signOut } from "@/lib/auth-client";
import { User, LayoutDashboard, FileText, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { session } = Route.useRouteContext();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const navLinks = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/admin/pages", icon: FileText, label: "Pages" },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--sea-ink)]">
      {/* Sidebar (Desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-[var(--line)] bg-[var(--surface)] shadow-sm md:flex">
        <div className="flex h-16 items-center px-6 border-b border-[var(--line)]">
          <Link
            to="/admin"
            className="flex items-center gap-2 font-bold text-lg text-[var(--lagoon-deep)]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--lagoon)] text-white">
              <User size={18} />
            </div>
            RSAI Click
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeProps={{
                className:
                  "bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)] font-medium",
              }}
              inactiveProps={{
                className:
                  "text-[var(--sea-ink-soft)] hover:bg-[var(--line)] hover:text-[var(--sea-ink)]",
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition"
            >
              <link.icon size={20} />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-[var(--line)] p-4">
          <div className="mb-4 flex items-center gap-3 px-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--lagoon)]/20 text-[var(--lagoon-deep)]">
              {session.user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-[var(--sea-ink-soft)]">
                {session.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-[var(--line)] bg-[var(--surface)] px-4 md:hidden">
          <Link
            to="/admin"
            className="flex items-center gap-2 font-bold text-[var(--lagoon-deep)]"
          >
            RSAI Click
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute inset-x-0 top-16 z-50 flex flex-col border-b border-[var(--line)] bg-[var(--surface)] p-4 shadow-lg md:hidden">
            <nav className="space-y-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  activeProps={{
                    className:
                      "bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)] font-medium",
                  }}
                  inactiveProps={{
                    className:
                      "text-[var(--sea-ink-soft)] hover:bg-[var(--line)] hover:text-[var(--sea-ink)]",
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 transition"
                >
                  <link.icon size={20} />
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-[var(--line)] pt-4">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={20} />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
