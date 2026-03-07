import { createFileRoute } from "@tanstack/react-router";
import { getPages } from "@/server/pages";
import { Plus, FileText, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/")({
  loader: async () => {
    const pages = await getPages({ data: undefined });
    return { pages };
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { pages } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500">Manage your microsites</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/pages/new">
          <div className="flex items-center gap-4 p-6 rounded-xl border border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black text-white">
              <Plus size={24} />
            </div>
            <div>
              <p className="font-semibold">Create New Page</p>
              <p className="text-sm text-slate-500">Start a new microsite</p>
            </div>
          </div>
        </Link>

        {pages.map((page) => (
          <Link key={page.id} to={`/admin/pages/${page.id}` as any}>
            <div className="flex items-center gap-4 p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer bg-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
                <FileText size={24} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{page.title}</p>
                <p className="text-sm text-slate-500">rsai.click/{page.slug}</p>
              </div>
              <ExternalLink size={16} className="text-slate-400" />
            </div>
          </Link>
        ))}
      </div>

      {pages.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-slate-400 mb-4">You haven't created any pages yet</p>
          <Link to="/admin/pages/new">
            <Button>Create your first page</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
