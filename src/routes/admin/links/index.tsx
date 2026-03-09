import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getShortLinksWithStats, type ShortLinkWithStats } from "@/server/shortLinks";
import { Link } from "@tanstack/react-router";
import { Plus, ExternalLink, Trash2, Copy, QrCode, BarChart3, Download, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import QRCodeLib from "qrcode";

export const Route = createFileRoute("/admin/links/")({
  loader: async () => {
    const shortLinks = await getShortLinksWithStats();
    return { shortLinks };
  },
  component: ShortLinksList,
});

interface QRModalData {
  slug: string;
  title: string;
  url: string;
  dataUrl: string;
}

function ShortLinksList() {
  const { shortLinks } = Route.useLoaderData();
  const router = useRouter();
  const [qrModal, setQrModal] = useState<QRModalData | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDelete = async (id: number, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this short link?")) return;

    setIsDeleting(id);
    try {
      const { deleteShortLink } = await import("@/server/shortLinks");
      await deleteShortLink({ data: id });
      toast.success(`"${title}" deleted successfully`);
      router.invalidate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete link";
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCopy = async (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/${slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleShowQR = async (link: ShortLinkWithStats, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/${link.slug}`;
    
    try {
      const dataUrl = await QRCodeLib.toDataURL(fullUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrModal({
        slug: link.slug,
        title: link.title || link.slug,
        url: fullUrl,
        dataUrl,
      });
    } catch (err) {
      console.error("Failed to generate QR code:", err);
      toast.error("Failed to generate QR code");
    }
  };

  const handleDownloadQR = () => {
    if (!qrModal) return;
    
    const link = document.createElement("a");
    link.download = `qrcode-${qrModal.slug}.png`;
    link.href = qrModal.dataUrl;
    link.click();
    toast.success("QR code downloaded!");
  };

  const handleCloseQR = () => {
    setQrModal(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Short Links</h1>
          <p className="text-muted-foreground">Manage your short links (like bit.ly)</p>
        </div>
        <Link to="/admin/links/new">
          <Button>
            <Plus size={16} className="mr-2" />
            New Link
          </Button>
        </Link>
      </div>

      {shortLinks.length > 0 ? (
        <div className="space-y-3">
          {shortLinks.map((link) => {
            const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/${link.slug}`;
            const linkTitle = link.title || link.slug;
            
            return (
              <div
                key={link.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors gap-3 bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {linkTitle}
                    </h4>
                    {link.isActive ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary font-mono truncate mb-1">{fullUrl}</p>
                  <p className="text-xs text-muted-foreground truncate mb-2">
                    → {link.targetUrl}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BarChart3 size={12} />
                      {link.clickCount.toLocaleString()} clicks
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to="/admin/links/stats/$linkId"
                    params={{ linkId: String(link.id) }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                  >
                    <BarChart3 size={14} />
                    Stats
                  </Link>
                  <Link
                    to="/admin/links/$linkId"
                    params={{ linkId: String(link.id) }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                  <button
                    onClick={(e) => handleShowQR(link, e)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                  >
                    <QrCode size={14} />
                    QR
                  </button>
                  <button
                    onClick={(e) => handleCopy(link.slug, e)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={14} />
                    Visit
                  </a>
                  <button
                    onClick={(e) => handleDelete(link.id, linkTitle, e)}
                    disabled={isDeleting === link.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
          <p className="text-muted-foreground mb-4">
            You haven't created any short links yet
          </p>
          <Link to="/admin/links/new">
            <Button>Create your first link</Button>
          </Link>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseQR}
        >
          <div
            className="bg-card rounded-xl p-6 max-w-sm w-full shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                QR Code
              </h3>
              <button
                onClick={handleCloseQR}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-foreground truncate">{qrModal.title}</p>
              <p className="text-xs text-muted-foreground truncate">{qrModal.url}</p>
            </div>
            
            <div className="flex justify-center mb-4 bg-white p-4 rounded-lg">
              <img src={qrModal.dataUrl} alt="QR Code" className="w-full max-w-[250px]" />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleDownloadQR}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
              >
                <Download size={16} />
                Download PNG
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(qrModal.url);
                  toast.success("Link copied!");
                }}
                className="px-4 py-2.5 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
