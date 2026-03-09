import { createFileRoute } from "@tanstack/react-router";
import { getPageById } from "@/server/pages";
import { getClickStats } from "@/server/clicks";
import { ArrowLeft, BarChart3, ExternalLink, Copy, Link as LinkIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/stats/$pageId")({
  loader: async ({ params }) => {
    const pageId = parseInt(params.pageId);
    const [page, clickStats] = await Promise.all([
      getPageById({ data: pageId }),
      getClickStats({ data: pageId }),
    ]);
    return { page, clickStats };
  },
  component: PageStats,
});

function PageStats() {
  const { page, clickStats } = Route.useLoaderData();
  const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${page.slug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      alert("URL copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleVisit = () => {
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{page.title}</h1>
          <p className="text-muted-foreground font-mono text-sm">{fullUrl}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyUrl}>
            <Copy size={14} className="mr-2" />
            Copy URL
          </Button>
          <Button size="sm" onClick={handleVisit}>
            <ExternalLink size={14} className="mr-2" />
            Visit
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5 sm:p-3">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {clickStats.totalClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2.5 sm:p-3">
              <LinkIcon size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Links</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {clickStats.linkStats.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5 sm:p-3">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Last 24 Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {clickStats.recentClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Link Statistics */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Link Statistics</h3>
        {clickStats.linkStats.length > 0 ? (
          <div className="space-y-3">
            {clickStats.linkStats.map((link: any) => (
              <div
                key={link.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border gap-3"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate mb-1">
                    {link.title}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {link.url}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-muted">
                    <BarChart3 size={14} className="text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      {link.clicks.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {link.clicks === 1 ? "click" : "clicks"}
                    </span>
                  </div>
                  {clickStats.totalClicks > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {((link.clicks / clickStats.totalClicks) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No links created yet</p>
          </div>
        )}
      </div>

      {/* Visual Chart */}
      {clickStats.linkStats.length > 0 && clickStats.totalClicks > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Click Distribution</h3>
          <div className="space-y-3">
            {clickStats.linkStats.map((link: any) => (
              <div key={link.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-medium text-foreground truncate flex-1 mr-2">
                    {link.title}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {link.clicks} ({((link.clicks / clickStats.totalClicks) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{
                      width: `${(link.clicks / clickStats.totalClicks) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
