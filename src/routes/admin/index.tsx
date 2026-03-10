import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { getDashboardStats } from "@/server/clicks";
import { getPagesWithStats } from "@/server/pages";
import { getShortLinkDashboardStats, getShortLinksWithStats } from "@/server/shortLinks";
import { BarChart3, Smartphone, Globe, Clock, ExternalLink, Copy, Link as LinkIcon, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [stats, pagesWithStats, shortLinkStats, shortLinksWithStats] = await Promise.all([
      getDashboardStats({ data: undefined }),
      getPagesWithStats({ data: undefined }),
      getShortLinkDashboardStats(),
      getShortLinksWithStats(),
    ]);
    return { stats, pagesWithStats, shortLinkStats, shortLinksWithStats };
  },
  component: AdminDashboard,
});

// Helper to merge browser/OS maps
function mergeMaps(...maps: Record<string, number>[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const map of maps) {
    for (const [key, value] of Object.entries(map)) {
      result[key] = (result[key] || 0) + value;
    }
  }
  return result;
}

function AdminDashboard() {
  const { stats, pagesWithStats, shortLinkStats, shortLinksWithStats } = Route.useLoaderData();

  // Combined stats (pages + short links)
  const totalClicks = stats.totalClicks + shortLinkStats.totalClicks;
  const recentClicks = stats.recentClicks + shortLinkStats.recentClicks;
  const combinedBrowsers = mergeMaps(stats.browsers, shortLinkStats.browsers);
  const combinedOS = mergeMaps(stats.operatingSystems, shortLinkStats.operatingSystems);

  const formatTime = (date: any) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Website visit statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Clicks */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2.5 sm:p-3">
              <BarChart3 size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {totalClicks.toLocaleString()}
              </p>
              {shortLinkStats.totalClicks > 0 && stats.totalClicks > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Pages: {stats.totalClicks.toLocaleString()} · Links: {shortLinkStats.totalClicks.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Clicks (24h) */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2.5 sm:p-3">
              <Clock size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Last 24 Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {recentClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Top Browser */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2.5 sm:p-3">
              <Globe size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Top Browser</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {Object.entries(combinedBrowsers).length > 0
                  ? Object.entries(combinedBrowsers).sort((a, b) => b[1] - a[1])[0][0]
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Top OS */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2.5 sm:p-3">
              <Smartphone size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Top OS</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {Object.entries(combinedOS).length > 0
                  ? Object.entries(combinedOS).sort((a, b) => b[1] - a[1])[0][0]
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Browser Distribution */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Browser Distribution</h3>
          <div className="space-y-3">
            {Object.entries(combinedBrowsers)
              .sort((a, b) => b[1] - a[1])
              .map(([browser, count]) => (
                <div key={browser} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {browser}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {count} ({totalClicks > 0 ? ((count / totalClicks) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${totalClicks > 0 ? (count / totalClicks) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            {Object.keys(combinedBrowsers).length === 0 && (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>

        {/* Operating System Distribution */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Operating System Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(combinedOS)
              .sort((a, b) => b[1] - a[1])
              .map(([os, count]) => (
                <div key={os} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {os}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {count} ({totalClicks > 0 ? ((count / totalClicks) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${totalClicks > 0 ? (count / totalClicks) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            {Object.keys(combinedOS).length === 0 && (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top IPs */}
      {stats.topIPs.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top IP Addresses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">IP Address</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-muted-foreground">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {stats.topIPs.map((item: any) => (
                  <tr key={item.ip} className="border-b border-border hover:bg-muted">
                    <td className="py-2 px-3 text-foreground font-mono text-xs sm:text-sm">
                      {item.ip}
                    </td>
                    <td className="text-right py-2 px-3 text-muted-foreground">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Clicks */}
      {stats.recentClicksList.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Clicks (Last 24h)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Time</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Browser</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">OS</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">IP</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-muted-foreground">Link</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentClicksList.map((click: any) => (
                  <tr key={click.id} className="border-b border-border hover:bg-muted">
                    <td className="py-2 px-3 text-muted-foreground text-xs">
                      {formatTime(click.clickedAt)}
                    </td>
                    <td className="py-2 px-3 text-foreground font-medium">{click.browser}</td>
                    <td className="py-2 px-3 text-foreground font-medium">{click.os}</td>
                    <td className="py-2 px-3 text-muted-foreground font-mono text-xs">
                      {click.ipAddress || "N/A"}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground truncate max-w-xs">
                      {click.linkTitle}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalClicks === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground mb-4">No click data yet. Create pages or short links and share them to see statistics.</p>
        </div>
      )}

      {/* Pages Section */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LinkIcon size={20} className="text-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Pages</h3>
          </div>
          <Link to="/admin/pages" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        {pagesWithStats.length > 0 ? (
          <div className="space-y-3">
            {pagesWithStats.map((page) => {
              const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${page.slug}`;
              
              const handleCopyUrl = async (e: React.MouseEvent) => {
                e.preventDefault();
                try {
                  await navigator.clipboard.writeText(fullUrl);
                  toast.success('URL copied to clipboard!');
                } catch (err) {
                  console.error('Failed to copy:', err);
                  toast.error('Failed to copy URL');
                }
              };
              
              return (
                <div
                  key={page.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground truncate">{page.title}</h4>
                      {page.isActive ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-primary font-mono truncate mb-2">{fullUrl}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <LinkIcon size={12} />
                        {page.linkCount} {page.linkCount === 1 ? 'link' : 'links'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 size={12} />
                        {page.clickCount.toLocaleString()} clicks
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/admin/stats/${page.id}`}>
                        <BarChart3 size={14} />
                        Stats
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                      <Copy size={14} />
                      Copy
                    </Button>
                    <Button variant="default" size="sm" asChild>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                        Visit
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">Belum ada halaman</p>
            <p className="text-xs text-muted-foreground">Buat halaman pertama Anda untuk mendapatkan URL akses</p>
          </div>
        )}
      </div>

      {/* Short Links Section */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 size={20} className="text-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Short Links</h3>
          </div>
          <Link to="/admin/links" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        {shortLinksWithStats.length > 0 ? (
          <div className="space-y-3">
            {shortLinksWithStats.slice(0, 5).map((link) => {
              const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${link.slug}`;
              
              const handleCopyUrl = async (e: React.MouseEvent) => {
                e.preventDefault();
                try {
                  await navigator.clipboard.writeText(fullUrl);
                  toast.success('Link copied to clipboard!');
                } catch (err) {
                  console.error('Failed to copy:', err);
                  toast.error('Failed to copy link');
                }
              };
              
              return (
                <div
                  key={link.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground truncate">
                        {link.title || link.slug}
                      </h4>
                      {link.isActive ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-primary font-mono truncate mb-1">{fullUrl}</p>
                    <p className="text-xs text-muted-foreground truncate mb-2">→ {link.targetUrl}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BarChart3 size={12} />
                        {link.clickCount.toLocaleString()} clicks
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to="/admin/links/stats/$linkId"
                        params={{ linkId: String(link.id) }}
                      >
                        <BarChart3 size={14} />
                        Stats
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                      <Copy size={14} />
                      Copy
                    </Button>
                    <Button variant="default" size="sm" asChild>
                      <a
                        href={fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                        Visit
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
            {shortLinksWithStats.length > 5 && (
              <div className="text-center pt-2">
                <Link to="/admin/links" className="text-xs text-primary hover:underline">
                  View all {shortLinksWithStats.length} short links
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">Belum ada short links</p>
            <Link to="/admin/links/new" className="text-xs text-primary hover:underline">
              Buat short link pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
