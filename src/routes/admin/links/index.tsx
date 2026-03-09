import { createFileRoute } from "@tanstack/react-router";
import { getShortLinksWithStats } from "@/server/shortLinks";
import { Link } from "@tanstack/react-router";
import { Plus, ExternalLink, Trash2, Copy, QrCode, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import QRCodeLib from "qrcode";

export const Route = createFileRoute("/admin/links/")({
  loader: async () => {
    const shortLinks = await getShortLinksWithStats({ data: undefined });
    return { shortLinks };
  },
  component: ShortLinksList,
});

function ShortLinksList() {
  const { shortLinks } = Route.useLoaderData();
  const [showQR, setShowQR] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this short link?")) return;

    const { deleteShortLink } = await import("@/server/shortLinks");
    await deleteShortLink({ data: id });
    window.location.reload();
  };

  const handleCopy = async (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/${slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShowQR = async (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/${slug}`;
    
    try {
      const dataUrl = await QRCodeLib.toDataURL(fullUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
      setShowQR(Date.now()); // Use timestamp as unique ID
    } catch (err) {
      console.error("Failed to generate QR code:", err);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleCloseQR = () => {
    setShowQR(null);
    setQrDataUrl("");
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
            
            return (
              <div
                key={link.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-colors gap-3 bg-card"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-foreground truncate">
                      {link.title || link.slug}
                    </h4>
                    {link.isActive ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
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
                  <button
                    onClick={(e) => handleShowQR(link.slug, e)}
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
                    onClick={(e) => handleDelete(link.id, e)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
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
      {showQR && qrDataUrl && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseQR}
        >
          <div
            className="bg-card rounded-xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
              QR Code
            </h3>
            <div className="flex justify-center mb-4">
              <img src={qrDataUrl} alt="QR Code" className="w-full max-w-xs rounded-lg" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadQR}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
              >
                Download QR Code
              </button>
              <button
                onClick={handleCloseQR}
                className="px-4 py-2 text-sm font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
