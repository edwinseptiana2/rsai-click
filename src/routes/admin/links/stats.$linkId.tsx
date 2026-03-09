import { createFileRoute } from "@tanstack/react-router";
import { getShortLinkById, getShortLinkStats } from "@/server/shortLinks";
import { ArrowLeft, BarChart3, Clock, Globe, Monitor, Pencil, Copy, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/links/stats/$linkId")({
  loader: async ({ params }) => {
    const linkId = parseInt(params.linkId);
    const [shortLink, stats] = await Promise.all([
      getShortLinkById({ data: linkId }),
      getShortLinkStats({ data: linkId }),
    ]);
    return { shortLink, stats };
  },
  component: ShortLinkStatsPage,
});

function ShortLinkStatsPage() {
  const { shortLink, stats } = Route.useLoaderData();
  const fullUrl = `${typeof window !== "undefined" ? window.location.origin : "rsai.click"}/${shortLink.slug}`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Link to="/admin/links">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {shortLink.title || shortLink.slug}
          </h1>
          <p className="text-muted-foreground font-mono text-sm truncate">{fullUrl}</p>
          <p className="text-xs text-muted-foreground truncate mt-1">→ {shortLink.targetUrl}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyUrl}>
            <Copy size={14} className="mr-2" />
            Copy
          </Button>
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm">
              <ExternalLink size={14} className="mr-2" />
              Visit
            </Button>
          </a>
          <Link to="/admin/links/$linkId" params={{ linkId: String(shortLink.id) }}>
            <Button variant="outline" size="sm">
              <Pencil size={14} className="mr-2" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2.5 sm:p-3">
              <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.totalClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2.5 sm:p-3">
              <Clock size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Last 24 Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.recentClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Browser & OS Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Browsers */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Browsers</h3>
          </div>
          {Object.keys(stats.browsers).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.browsers)
                .sort((a, b) => b[1] - a[1])
                .map(([browser, count]) => (
                  <div key={browser}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{browser}</span>
                      <span className="text-xs text-muted-foreground">
                        {count} ({stats.totalClicks > 0 ? ((count / stats.totalClicks) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalClicks > 0 ? (count / stats.totalClicks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          )}
        </div>

        {/* Operating Systems */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={16} className="text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Operating Systems</h3>
          </div>
          {Object.keys(stats.operatingSystems).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.operatingSystems)
                .sort((a, b) => b[1] - a[1])
                .map(([os, count]) => (
                  <div key={os}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{os}</span>
                      <span className="text-xs text-muted-foreground">
                        {count} ({stats.totalClicks > 0 ? ((count / stats.totalClicks) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${stats.totalClicks > 0 ? (count / stats.totalClicks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
          )}
        </div>
      </div>

      {/* Recent Clicks */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Clicks (Last 24h)</h3>
        {stats.recentClicksList.length > 0 ? (
          <div className="space-y-2">
            {stats.recentClicksList.map((click) => (
              <div
                key={click.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Globe size={14} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {click.browser} on {click.os}
                    </p>
                    {click.referer && (
                      <p className="text-xs text-muted-foreground truncate">
                        from: {click.referer}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {click.ipAddress && (
                    <span className="font-mono">{click.ipAddress}</span>
                  )}
                  <span>
                    {new Date(click.clickedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No clicks in the last 24 hours</p>
          </div>
        )}
      </div>

      {/* Top IPs */}
      {stats.topIPs.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top IP Addresses</h3>
          <div className="space-y-2">
            {stats.topIPs.map((item, index) => (
              <div
                key={item.ip}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-6">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-mono text-foreground">{item.ip}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {item.count.toLocaleString()} {item.count === 1 ? "click" : "clicks"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
