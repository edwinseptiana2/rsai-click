import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
        <nav className="page-wrap flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-[var(--lagoon)] to-[var(--palm)]" />
            <span className="text-lg font-bold text-[var(--sea-ink)]">
              RSAI Click
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] no-underline transition hover:text-[var(--sea-ink)]"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-4 py-2 text-sm font-semibold text-white no-underline shadow-lg shadow-[var(--lagoon)]/20 transition hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="rise-in mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--kicker)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--lagoon)]" />
            Link in Bio Platform
          </div>
          <h1 className="display-title mb-6 text-4xl font-bold leading-tight text-[var(--sea-ink)] sm:text-5xl lg:text-6xl">
            One Link.{" "}
            <span className="bg-gradient-to-r from-[var(--lagoon)] to-[var(--palm)] bg-clip-text text-transparent">
              All Your Content.
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-[var(--sea-ink-soft)]">
            Create a beautiful, customizable page to share all your important
            links. Track clicks and grow your audience.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--lagoon)] to-[var(--lagoon-deep)] px-6 py-3 text-sm font-semibold text-white no-underline shadow-xl shadow-[var(--lagoon)]/25 transition hover:scale-[1.02] hover:shadow-2xl hover:shadow-[var(--lagoon)]/30"
            >
              Create Your Page — Free
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="px-4 pb-20">
        <div className="page-wrap grid gap-4 sm:grid-cols-3">
          <div className="feature-card rounded-2xl border border-[var(--line)] p-6 transition">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--lagoon)]/20 to-[var(--lagoon)]/5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--lagoon)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-[var(--sea-ink)]">
              Multiple Links
            </h3>
            <p className="text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              Add unlimited links to your page. Social media, portfolio, blog —
              everything in one place.
            </p>
          </div>
          <div className="feature-card rounded-2xl border border-[var(--line)] p-6 transition">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--palm)]/20 to-[var(--palm)]/5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--palm)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-[var(--sea-ink)]">
              Click Analytics
            </h3>
            <p className="text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              Track every click. See which links perform best and optimize your
              content strategy.
            </p>
          </div>
          <div className="feature-card rounded-2xl border border-[var(--line)] p-6 transition">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-500/5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(139,92,246)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-[var(--sea-ink)]">
              Custom Themes
            </h3>
            <p className="text-sm leading-relaxed text-[var(--sea-ink-soft)]">
              Choose from beautiful themes. Make your page truly yours with
              custom styling.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--line)] bg-[var(--header-bg)] px-4 py-6 text-center text-xs text-[var(--sea-ink-soft)]">
        <p>
          &copy; {new Date().getFullYear()} RSAI Click. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
