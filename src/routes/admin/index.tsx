import { createFileRoute } from "@tanstack/react-router";
import { getDashboardStats } from "@/server/clicks";
import { BarChart3, Smartphone, Globe, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const stats = await getDashboardStats({ data: undefined });
    return { stats };
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { stats } = Route.useLoaderData();

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
        <p className="text-slate-500">Website visit statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Clicks */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2.5 sm:p-3">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-slate-500">Total Clicks</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {stats.totalClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Clicks (24h) */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-100 p-2.5 sm:p-3">
              <Clock size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-slate-500">Last 24 Hours</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {stats.recentClicks.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Top Browser */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-100 p-2.5 sm:p-3">
              <Globe size={20} className="text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-slate-500">Top Browser</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                {Object.entries(stats.browsers).length > 0
                  ? Object.entries(stats.browsers).sort((a, b) => b[1] - a[1])[0][0]
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Top OS */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2.5 sm:p-3">
              <Smartphone size={20} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-slate-500">Top OS</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">
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
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Browser Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.browsers)
              .sort((a, b) => b[1] - a[1])
              .map(([browser, count]) => (
                <div key={browser} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">
                        {browser}
                      </span>
                      <span className="text-xs text-slate-500">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
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
              <p className="text-sm text-slate-500">No data available</p>
            )}
          </div>
        </div>

        {/* Operating System Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Operating System Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.operatingSystems)
              .sort((a, b) => b[1] - a[1])
              .map(([os, count]) => (
                <div key={os} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-slate-700">
                        {os}
                      </span>
                      <span className="text-xs text-slate-500">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
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
              <p className="text-sm text-slate-500">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Top IPs */}
      {stats.topIPs.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Top IP Addresses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">IP Address</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-slate-600">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {stats.topIPs.map((item: any) => (
                  <tr key={item.ip} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-700 font-mono text-xs sm:text-sm">
                      {item.ip}
                    </td>
                    <td className="text-right py-2 px-3 text-slate-600">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Clicks */}
      {stats.recentClicksList.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Clicks (Last 24h)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Time</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Browser</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">OS</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">IP</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-slate-600">Link</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentClicksList.map((click: any) => (
                  <tr key={click.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-600 text-xs">
                      {formatTime(click.clickedAt)}
                    </td>
                    <td className="py-2 px-3 text-slate-700 font-medium">{click.browser}</td>
                    <td className="py-2 px-3 text-slate-700 font-medium">{click.os}</td>
                    <td className="py-2 px-3 text-slate-600 font-mono text-xs">
                      {click.ipAddress || "N/A"}
                    </td>
                    <td className="py-2 px-3 text-slate-600 truncate max-w-xs">
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
        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-slate-400 mb-4">No click data yet. Create pages and share them to see statistics.</p>
        </div>
      )}
    </div>
  );
}
