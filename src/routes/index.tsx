import { Button, buttonVariants } from "#/components/ui/button";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import ThemeToggle from "#/components/ThemeToggle";
import { useSession, signOut } from "#/lib/auth-client";
import { cn } from "#/lib/utils";
import { useState, useCallback } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

// Tailwind gradient combinations for random selection
const gradientDirections = [
  "bg-linear-to-r",
  "bg-linear-to-l",
  "bg-linear-to-t",
  "bg-linear-to-b",
  "bg-linear-to-tr",
  "bg-linear-to-tl",
  "bg-linear-to-br",
  "bg-linear-to-bl",
];

const gradientColors = [
  ["from-red-500", "via-orange-500", "to-yellow-500"],
  ["from-pink-500", "via-rose-500", "to-red-500"],
  ["from-purple-500", "via-violet-500", "to-indigo-500"],
  ["from-blue-500", "via-cyan-500", "to-teal-500"],
  ["from-green-500", "via-emerald-500", "to-teal-500"],
  ["from-amber-500", "via-orange-500", "to-red-500"],
  ["from-fuchsia-500", "via-purple-500", "to-violet-500"],
  ["from-cyan-500", "via-blue-500", "to-indigo-500"],
  ["from-lime-500", "via-green-500", "to-emerald-500"],
  ["from-rose-500", "via-pink-500", "to-fuchsia-500"],
  ["from-sky-500", "via-blue-500", "to-indigo-500"],
  ["from-indigo-500", "via-purple-500", "to-pink-500"],
];

function getRandomGradient(): string {
  const direction = gradientDirections[Math.floor(Math.random() * gradientDirections.length)];
  const colorSet = gradientColors[Math.floor(Math.random() * gradientColors.length)];
  return `${direction} ${colorSet.join(" ")}`;
}

function LandingPage() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [currentGradient, setCurrentGradient] = useState("bg-linear-to-r from-(--lagoon) to-(--palm)");
  const [patternHistory, setPatternHistory] = useState<string[]>([]);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const handleRandomGradient = useCallback(() => {
    const newGradient = getRandomGradient();
    setCurrentGradient(newGradient);
    setPatternHistory((prev) => [newGradient, ...prev].slice(0, 5));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-(--line) bg-(--header-bg) px-4 backdrop-blur-lg transition-colors dark:border-slate-700 dark:bg-[#60d7cf]">
        <nav className="page-wrap flex items-center justify-between py-3 sm:py-4">
          <div className="flex items-center gap-2">
            {/* <img
              src="/logo-rsai-click-new.png"
              alt="RSAI Click"
              className="h-7 w-auto"
            /> */}
            <img
              src="/rsai-click-new-icon-only.png"
              alt="RSAI Click"
              className="h-7 w-auto rounded-sm dark:bg-white"
            />
            <span className="text-lg font-bold text-(--sea-ink) dark:text-slate-50">
              RSAI Click
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-red-600 no-underline transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>

                <Link
                  to="/login"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-lg px-4 py-2 text-sm font-semibold text-(--sea-ink-soft) no-underline transition hover:text-(--sea-ink) dark:text-slate-400 dark:hover:text-slate-100")}
                >
                  Sign in
                </Link>

                <Button asChild style={{ color: "white" }} >
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="rise-in mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--chip-line) bg-(--chip-bg) px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-(--kicker) dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-(--lagoon) dark:bg-[#60d7cf]" />
            Link in Bio Platform
          </div>
          <h1 className="display-title mb-6 text-4xl font-bold leading-tight text-(--sea-ink) dark:text-slate-50 sm:text-5xl lg:text-6xl">
            One Link.{" "}
            <span className="bg-linear-to-r from-(--lagoon) to-(--palm) bg-clip-text text-transparent dark:from-[#60d7cf] dark:to-[#6ec89a]">
              All Your Content.
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-lg leading-relaxed text-(--sea-ink-soft) dark:text-slate-400">
            Create a beautiful, customizable page to share all your important
            links. Track clicks and grow your audience.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {session ? (
              <Button variant="default" style={{ color: "white" }} asChild size="lg">
                <Link to="/admin" className="gap-2">
                  Go to Dashboard
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
              </Button>
            ) : (
              <>
                <Button variant="default" style={{ color: "white" }} asChild size="lg">
                  <Link to="/register" className="gap-2">
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
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="px-4 pb-20">
        <div className="page-wrap grid gap-4 sm:grid-cols-3">
          <div className="feature-card rounded-2xl border border-(--line) p-6 transition dark:border-slate-700">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-(--lagoon)/20 to-(--lagoon)/5 dark:from-[#60d7cf]/20 dark:to-[#60d7cf]/5">
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
            <h3 className="mb-1 font-semibold text-(--sea-ink) dark:text-slate-50">
              Multiple Links
            </h3>
            <p className="text-sm leading-relaxed text-(--sea-ink-soft) dark:text-slate-400">
              Add unlimited links to your page. Social media, portfolio, blog —
              everything in one place.
            </p>
          </div>
          <div className="feature-card rounded-2xl border border-(--line) p-6 transition dark:border-slate-700">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-(--palm)/20 to-(--palm)/5 dark:from-[#6ec89a]/20 dark:to-[#6ec89a]/5">
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
            <h3 className="mb-1 font-semibold text-(--sea-ink) dark:text-slate-50">
              Click Analytics
            </h3>
            <p className="text-sm leading-relaxed text-(--sea-ink-soft) dark:text-slate-400">
              Track every click. See which links perform best and optimize your
              content strategy.
            </p>
          </div>
          <div className="feature-card rounded-2xl border border-(--line) p-6 transition dark:border-slate-700">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-purple-500/20 to-purple-500/5 dark:from-violet-500/20 dark:to-violet-500/5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(139,92,246)"
                strokeWidth="2"
                strokeLinecap="round"
                className="dark:stroke-violet-400"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3 className="mb-1 font-semibold text-(--sea-ink) dark:text-slate-50">
              Custom Themes
            </h3>
            <p className="text-sm leading-relaxed text-(--sea-ink-soft) dark:text-slate-400">
              Choose from beautiful themes. Make your page truly yours with
              custom styling.
            </p>
          </div>
        </div>
      </section>

      {/* Background Pattern Showcase */}
      <section className="px-4 py-20">
        <div className="page-wrap">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-(--sea-ink) dark:text-slate-50 sm:text-4xl">
              Beautiful Background Patterns
            </h2>
            <p className="mx-auto max-w-xl text-(--sea-ink-soft) dark:text-slate-400">
              Explore our collection of stunning gradient patterns. Click the button below to discover a random gradient combination.
            </p>
          </div>

          {/* Gradient Preview Card */}
          <div className="mx-auto max-w-3xl">
            <div
              className={cn(
                "relative overflow-hidden rounded-3xl p-12 transition-all duration-700 ease-out",
                currentGradient
              )}
            >
              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-20">
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
              </div>

              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-white">
                  Gradient Preview
                </h3>
                <p className="text-white/80">
                  {currentGradient.replace(/bg-linear-to-/g, '').replace(/-/g, ' ').toUpperCase()}
                </p>
              </div>

              {/* Decorative circles */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            </div>

            {/* Controls */}
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={handleRandomGradient}
                size="lg"
                className="gap-2 rounded-full px-8"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                Random Tailwind Gradient
              </Button>

              {patternHistory.length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (patternHistory.length > 1) {
                      const [, ...rest] = patternHistory;
                      setPatternHistory(rest);
                      setCurrentGradient(rest[0] || "bg-linear-to-r from-(--lagoon) to-(--palm)");
                    }
                  }}
                  disabled={patternHistory.length <= 1}
                  className="gap-2 rounded-full"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 7v6h6" />
                    <path d="M21 17a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 13" />
                  </svg>
                  Previous
                </Button>
              )}
            </div>

            {/* History dots */}
            {patternHistory.length > 0 && (
              <div className="mt-6 flex justify-center gap-2">
                {patternHistory.slice(0, 5).map((gradient, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentGradient(gradient)}
                    className={cn(
                      "h-3 w-3 rounded-full transition-all duration-300",
                      index === 0 ? "scale-125" : "opacity-50 hover:opacity-75"
                    )}
                    style={{
                      background: gradient.includes('from-')
                        ? `linear-gradient(135deg, var(--tw-gradient-from, #6366f1), var(--tw-gradient-to, #8b5cf6))`
                        : '#6366f1'
                    }}
                    title={gradient}
                  />
                ))}
              </div>
            )}

            {/* Gradient code display */}
            <div className="mt-8 rounded-xl border border-(--line) bg-(--header-bg) p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <code className="text-sm text-(--sea-ink) dark:text-slate-300">
                  className="{currentGradient}"
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(currentGradient)}
                  className="text-(--sea-ink-soft) hover:text-(--sea-ink)"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-(--line) bg-(--header-bg) px-4 py-6 text-center text-xs text-(--sea-ink-soft) transition-colors dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-400">
        <p>
          &copy; {new Date().getFullYear()} RSAI Click. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
