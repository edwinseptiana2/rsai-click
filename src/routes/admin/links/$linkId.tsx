import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { getShortLinkById, checkShortLinkSlugAvailability } from "@/server/shortLinks";
import { Loader2, Check, X } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import React from "react";

export const Route = createFileRoute("/admin/links/$linkId")({
  loader: async ({ params }) => {
    const linkId = parseInt(params.linkId);
    const shortLink = await getShortLinkById({ data: linkId });
    return { shortLink };
  },
  component: EditShortLink,
});

function EditShortLink() {
  const { shortLink } = Route.useLoaderData();
  const navigate = useNavigate();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    targetUrl: shortLink.targetUrl,
    slug: shortLink.slug,
    title: shortLink.title || "",
    description: shortLink.description || "",
    isActive: shortLink.isActive,
  });

  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const checkSlugFn = useServerFn(checkShortLinkSlugAvailability);

  // Debounced slug check
  React.useEffect(() => {
    if (!formData.slug || formData.slug === shortLink.slug) {
      setIsSlugAvailable(null);
      setIsCheckingSlug(false);
      return;
    }

    // Basic format validation before server check
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.slug)) {
      setIsSlugAvailable(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const result = await checkSlugFn({ 
          data: { 
            slug: formData.slug,
            excludeId: shortLink.id
          } 
        });
        setIsSlugAvailable(result.available);
      } catch (err) {
        console.error("Check slug error:", err);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.slug, shortLink.slug, shortLink.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.targetUrl) {
        setError("Target URL is required");
        return;
      }

      try {
        new URL(formData.targetUrl);
      } catch {
        setError("Please enter a valid URL (must include http:// or https://)");
        return;
      }

      if (formData.slug && !/^[a-zA-Z0-9_-]+$/.test(formData.slug)) {
        setError("Slug can only contain letters, numbers, hyphens, and underscores");
        return;
      }

      const { updateShortLink } = await import("@/server/shortLinks");
      await updateShortLink({
        data: {
          id: shortLink.id,
          targetUrl: formData.targetUrl,
          slug: formData.slug || undefined,
          title: formData.title || undefined,
          description: formData.description || undefined,
          isActive: formData.isActive,
        },
      });

      toast.success("Short link updated successfully");
      router.invalidate();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update short link";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this short link? This action cannot be undone.")) return;

    try {
      const { deleteShortLink } = await import("@/server/shortLinks");
      await deleteShortLink({ data: shortLink.id });
      toast.success("Short link deleted");
      navigate({ to: "/admin/links" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete short link";
      toast.error(message);
    }
  };

  const fullUrl = `${typeof window !== "undefined" ? window.location.origin : "rsai.click"}/${formData.slug}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/links">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Edit Short Link</h1>
          <p className="text-muted-foreground font-mono text-sm">{fullUrl}</p>
        </div>
        <Link to="/admin/links/stats/$linkId" params={{ linkId: String(shortLink.id) }}>
          <Button variant="outline" size="sm">
            Stats
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="targetUrl">
            Target URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="targetUrl"
            type="url"
            placeholder="https://example.com/very/long/url"
            value={formData.targetUrl}
            onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            The long URL you want to shorten
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Custom Slug</Label>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                {typeof window !== "undefined" ? window.location.origin : "rsai.click"}/
              </span>
              <div className="relative flex-1">
                <Input
                  id="slug"
                  type="text"
                  placeholder="my-link"
                  value={formData.slug}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^a-zA-Z0-9_-]/g, "");
                    setFormData({ ...formData, slug: val });
                  }}
                  className={`pr-10 ${
                    formData.slug !== shortLink.slug && isSlugAvailable === false ? "border-red-500 focus-visible:ring-red-500" : 
                    formData.slug !== shortLink.slug && isSlugAvailable === true ? "border-green-500 focus-visible:ring-green-500" : ""
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                  {isCheckingSlug && (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  )}
                  {!isCheckingSlug && formData.slug !== shortLink.slug && isSlugAvailable === true && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {!isCheckingSlug && formData.slug !== shortLink.slug && isSlugAvailable === false && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            {formData.slug !== shortLink.slug && isSlugAvailable === false && formData.slug && (
              <p className="text-[10px] text-red-500">
                {!/^[a-zA-Z0-9_-]+$/.test(formData.slug) 
                  ? "Slug can only contain letters, numbers, hyphens, and underscores"
                  : "This slug is already taken."}
              </p>
            )}
            {formData.slug !== shortLink.slug && isSlugAvailable === true && (
              <p className="text-[10px] text-green-600">This slug is available!</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title (optional)</Label>
          <Input
            id="title"
            type="text"
            placeholder="My Link"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="What is this link for?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-border">
          <div>
            <Label htmlFor="isActive" className="text-sm font-medium">
              Active
            </Label>
            <p className="text-xs text-muted-foreground">
              When disabled, the link will return a 404
            </p>
          </div>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              <Save size={16} className="mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            <Link to="/admin/links">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 size={14} className="mr-2" />
            Delete
          </Button>
        </div>
      </form>
    </div>
  );
}
