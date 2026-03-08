import { createFileRoute } from "@tanstack/react-router";
import { getPages } from "@/server/pages";
import { Link } from "@tanstack/react-router";
import { Plus, ExternalLink, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/pages/")({
  loader: async () => {
    const pages = await getPages({ data: undefined });
    return { pages };
  },
  component: PagesList,
});

function PagesList() {
  const { pages } = Route.useLoaderData();

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this page?")) return;
    
    const { deletePage } = await import("@/server/pages");
    await deletePage({ data: id });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pages</h1>
          <p className="text-slate-500">Manage your microsites</p>
        </div>
        <Link to="/admin/pages/new">
          <Button>
            <Plus size={16} className="mr-2" />
            New Page
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <Link key={page.id} to={`/admin/pages/${page.id}`} className="block">
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer bg-white overflow-hidden">
              {/* Profile Image */}
              <div className="flex h-32 w-full items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                {page.avatarUrl ? (
                  <img
                    src={page.avatarUrl}
                    alt={page.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={40} className="text-slate-400" />
                )}
              </div>
              
              {/* Page Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-slate-900">{page.title}</p>
                <p className="text-xs text-slate-500 truncate">rsai.click/{page.slug}</p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 gap-1"
                >
                  <ExternalLink size={14} />
                  <span className="text-xs">Visit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  onClick={(e) => handleDelete(page.id, e)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
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
