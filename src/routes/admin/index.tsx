import { createFileRoute } from "@tanstack/react-router";
import { getDashboardStats } from "@/server/clicks";
import { getPagesWithStats } from "@/server/pages";
import { BarChart3, Smartphone, Globe, Clock, ExternalLink, Copy, Link as LinkIcon } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const [stats, pagesWithStats] = await Promise.all([
      getDashboardStats({ data: undefined }),
      getPagesWithStats({ data: undefined }),
    ]);
    return { stats, pagesWithStats };
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { stats, pagesWithStats } = Route.useLoaderData();

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
            <div className="rounded-lg bg-blue-100 p-2.5 sm:p-3">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Clicks</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.totalClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Clicks (24h) */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2.5 sm:p-3">
              <Clock size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Last 24 Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {stats.recentClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Top Browser */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5 sm:p-3">
              <Globe size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Top Browser</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {Object.entries(stats.browsers).length > 0
                  ? Object.entries(stats.browsers).sort((a, b) => b[1] - a[1])[0][0]
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Top OS */}
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2.5 sm:p-3">
              <Smartphone size={20} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground">Top OS</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {Object.entries(stats.operatingSystems).length > 0
                  ? Object.entries(stats.operatingSystems).sort((a, b) => b[1] - a[1])[0][0]
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
            {Object.entries(stats.browsers)
              .sort((a, b) => b[1] - a[1])
              .map(([browser, count]) => (
                <div key={browser} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {browser}
                      </span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.totalClicks) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            {Object.keys(stats.browsers).length === 0 && (
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
            {Object.entries(stats.operatingSystems)
              .sort((a, b) => b[1] - a[1])
              .map(([os, count]) => (
                <div key={os} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-foreground">
                        {os}
                      </span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(count / stats.totalClicks) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            {Object.keys(stats.operatingSystems).length === 0 && (
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

      {stats.totalClicks === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground mb-4">No click data yet. Create pages and share them to see statistics.</p>
        </div>
      )}

      {/* URL Access Section */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon size={20} className="text-foreground" />
          <h3 className="text-sm font-semibold text-foreground">URL Akses</h3>
        </div>
        {pagesWithStats.length > 0 ? (
          <div className="space-y-3">
            {pagesWithStats.map((page) => {
              const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${page.slug}`;
              
              const handleCopyUrl = async (e: React.MouseEvent) => {
                e.preventDefault();
                try {
                  await navigator.clipboard.writeText(fullUrl);
                  alert('URL copied to clipboard!');
                } catch (err) {
                  console.error('Failed to copy:', err);
                }
              };
              
              const handleVisit = (e: React.MouseEvent) => {
                e.preventDefault();
                window.open(fullUrl, '_blank', 'noopener,noreferrer');
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
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate mb-2">{fullUrl}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <LinkIcon size={12} />
                        {page.linkCount} {page.linkCount === 1 ? 'link' : 'links'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 size={12} />
                        {page.clickCount.toLocaleString()} {page.clickCount === 1 ? 'click' : 'clicks'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/admin/stats/${page.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                    >
                      <BarChart3 size={14} />
                      Stats
                    </a>
                    <button
                      onClick={handleCopyUrl}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button
                      onClick={handleVisit}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                    >
                      <ExternalLink size={14} />
                      Visit
                    </button>
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
    </div>
  );
}
