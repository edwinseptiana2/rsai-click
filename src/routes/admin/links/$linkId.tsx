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
import { getShortLinkById } from "@/server/shortLinks";

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
      setError(message);
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {typeof window !== "undefined" ? window.location.origin : "rsai.click"}/
            </span>
            <Input
              id="slug"
              type="text"
              placeholder="my-link"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              pattern="[a-zA-Z0-9_-]+"
            />
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
