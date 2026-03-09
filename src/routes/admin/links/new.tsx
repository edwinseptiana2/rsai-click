import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/links/new")({
  component: NewShortLink,
});

function NewShortLink() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    targetUrl: "",
    slug: "",
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate target URL
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

      // Validate slug if provided
      if (formData.slug && !/^[a-zA-Z0-9_-]+$/.test(formData.slug)) {
        setError("Slug can only contain letters, numbers, hyphens, and underscores");
        return;
      }

      const { createShortLink } = await import("@/server/shortLinks");
      const result = await createShortLink({
        data: {
          targetUrl: formData.targetUrl,
          slug: formData.slug || undefined,
          title: formData.title || undefined,
          description: formData.description || undefined,
        },
      });

      // Navigate to links list
      navigate({ to: "/admin/links" });
    } catch (err: any) {
      setError(err?.message || "Failed to create short link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/admin/links">
          <Button variant="ghost" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Short Link</h1>
          <p className="text-muted-foreground">Create a new short link like bit.ly</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-xl border border-border">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
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
          <Label htmlFor="slug">Custom Slug (optional)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {typeof window !== 'undefined' ? window.location.origin : 'rsai.click'}/
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
          <p className="text-xs text-muted-foreground">
            Leave empty to auto-generate a random slug
          </p>
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
          <p className="text-xs text-muted-foreground">
            A friendly name for this link
          </p>
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

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Short Link"}
          </Button>
          <Link to="/admin/links">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
