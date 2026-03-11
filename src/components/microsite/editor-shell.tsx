import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, User, Link, ExternalLink, Share2, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ICON_MAP, getButtonStyles, TEXT_COLORS } from "@/components/microsite/button-templates";
import { BACKGROUND_PATTERNS } from "@/components/microsite/background-patterns";
import { checkSlugAvailability } from "@/server/pages";

// Helper function to convert file to base64 data URL
async function handleImageUpload(
  e: React.ChangeEvent<HTMLInputElement>,
  onUpdatePage?: (updates: any) => void
) {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert("Image size must be less than 2MB");
    return;
  }

  // Convert to base64 data URL
  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target?.result as string;
    onUpdatePage?.({ avatarUrl: dataUrl });
  };
  reader.readAsDataURL(file);
}

export function EditorShell({
  page,
  onAddLink,
  onUpdatePage,
  children,
}: {
  page: any;
  onAddLink?: () => void;
  onUpdatePage?: (updates: any) => void;
  children: React.ReactNode;
}) {
  const [isSlugAvailable, setIsSlugAvailable] = React.useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = React.useState(false);
  const [slugInput, setSlugInput] = React.useState(page?.slug || "");
  const [showSlugConfirm, setShowSlugConfirm] = React.useState(false);

  // Update slugInput when page.slug changes (e.g. on mount or after save)
  React.useEffect(() => {
    if (page?.slug && page.slug !== slugInput) {
      setSlugInput(page.slug);
      setIsSlugAvailable(null);
    }
  }, [page?.slug]);

  // Debounced slug availability check
  React.useEffect(() => {
    if (!slugInput || slugInput === page?.slug) {
      setIsSlugAvailable(null);
      setIsCheckingSlug(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const result = await checkSlugAvailability({
          data: {
            slug: slugInput,
            excludeId: page?.id
          }
        });
        setIsSlugAvailable(result.available);
      } catch (error) {
        console.error("Error checking slug availability:", error);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [slugInput, page?.slug, page?.id]);

  // Show toast notification when slug is unavailable
  React.useEffect(() => {
    if (isSlugAvailable === false) {
      toast.error("Slug is already taken. Please choose another.");
    }
  }, [isSlugAvailable]);
  const [previewKey, setPreviewKey] = React.useState(0);
  const [shareToast, setShareToast] = React.useState<{ show: boolean; message: string }>({ show: false, message: "" });

  React.useEffect(() => {
    // Force preview re-render whenever page data changes
    // This includes text color changes, link updates, etc.
    setPreviewKey(k => k + 1);
  }, [page]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/${page?.slug}`;
    const shareTitle = page?.title || "Check out my microsite";
    const shareText = page?.bio || shareTitle;

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareToast({ show: true, message: "Shared successfully!" });
      } catch (err) {
        // User cancelled share or error occurred
        if ((err as any).name !== "AbortError") {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      // Fallback to copy to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShareToast({ show: true, message: "Link copied to clipboard!" });
      setTimeout(() => setShareToast({ show: false, message: "" }), 2000);
    }).catch(err => {
      console.error("Failed to copy:", err);
      setShareToast({ show: true, message: "Failed to copy link" });
      setTimeout(() => setShareToast({ show: false, message: "" }), 2000);
    });
  };

  return (
    <div className="flex flex-col lg:flex-row w-full gap-4 lg:gap-6 min-w-0 items-start">
      {/* Left Panel: Editor */}
      <div className="w-full lg:flex-1 min-w-0 flex flex-col bg-card rounded-xl border border-border shadow-sm">
        <Tabs defaultValue="components" className="flex-1 flex flex-col">
          <div className="px-3 sm:px-4 md:px-6 pt-3 sm:pt-4 md:pt-6 pb-3 sm:pb-4 border-b border-border">
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10 md:h-11 p-1 bg-muted rounded-lg">
              <TabsTrigger
                value="components"
                className="rounded-md text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <span className="sm:hidden">Items</span>
                <span className="hidden sm:inline">Components</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-md text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                <span className="sm:hidden">Gear</span>
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 p-3 sm:p-4 md:p-6">
            <TabsContent
              value="components"
              className="mt-0 space-y-4 md:space-y-6 focus-visible:outline-none min-w-0"
            >
              <Button
                onClick={onAddLink}
                className="w-full h-10 sm:h-12 bg-black hover:bg-black/90 text-white rounded-lg font-semibold gap-2 text-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Add new component</span>
                <span className="sm:hidden">Add</span>
              </Button>

              <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
                {/* Component List will go here */}
                {children}
              </div>
            </TabsContent>

            <TabsContent
              value="settings"
              className="mt-0 space-y-4 md:space-y-6 focus-visible:outline-none min-w-0"
            >
              <div className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground border-b pb-2">
                    Profile
                  </h3>
                  <div className="space-y-3 sm:space-y-4 pt-2">
                    {/* Avatar Image Upload */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="page-avatar" className="text-xs sm:text-sm">Profile Image</Label>
                      <div className="flex items-end gap-2">
                        <div className="flex-1 hidden sm:flex">
                          <div className="flex items-center gap-2 w-full">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden border border-slate-300 flex items-center justify-center">
                              {page?.avatarUrl ? (
                                <img
                                  src={page.avatarUrl}
                                  alt="Avatar preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={20} className="text-slate-400" />
                              )}
                            </div>
                            <input
                              id="page-avatar"
                              type="file"
                              accept="image/*"
                              className="flex-1 text-xs"
                              onChange={(e) => handleImageUpload(e, onUpdatePage)}
                            />
                          </div>
                        </div>
                        <div className="flex-1 sm:hidden">
                          <input
                            id="page-avatar-mobile"
                            type="file"
                            accept="image/*"
                            className="text-xs w-full"
                            onChange={(e) => handleImageUpload(e, onUpdatePage)}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500">Or paste image URL:</p>
                      <Input
                        value={page?.avatarUrl || ""}
                        onChange={(e) =>
                          onUpdatePage?.({ avatarUrl: e.target.value })
                        }
                        placeholder="https://example.com/image.jpg"
                        className="text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="page-title" className="text-xs sm:text-sm">Title</Label>
                      <Input
                        id="page-title"
                        value={page?.title || ""}
                        onChange={(e) =>
                          onUpdatePage?.({ title: e.target.value })
                        }
                        placeholder="Enter page title"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="page-bio" className="text-xs sm:text-sm">Bio</Label>
                      <textarea
                        id="page-bio"
                        className="flex min-h-[60px] sm:min-h-[80px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={page?.bio || ""}
                        onChange={(e) =>
                          onUpdatePage?.({ bio: e.target.value })
                        }
                        placeholder="Tell us about yourself"
                      />
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Title Color</Label>
                      <div className="grid grid-cols-7 gap-2">
                        {TEXT_COLORS.map((textColor) => (
                          <button
                            key={textColor.id}
                            type="button"
                            onClick={() => onUpdatePage?.({ titleColor: textColor.id })}
                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition-all ${page?.titleColor === textColor.id || (!page?.titleColor && textColor.id === 'default')
                              ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                              : "hover:scale-105"
                              } ${textColor.id === 'white' ? 'bg-slate-800' : 'bg-white'}`}
                            title={textColor.name}
                          >
                            <span className={textColor.class} style={textColor.style}>Aa</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <Label className="text-xs sm:text-sm">Bio Color</Label>
                      <div className="grid grid-cols-7 gap-2">
                        {TEXT_COLORS.map((textColor) => (
                          <button
                            key={textColor.id}
                            type="button"
                            onClick={() => onUpdatePage?.({ bioColor: textColor.id })}
                            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-bold transition-all ${page?.bioColor === textColor.id || (!page?.bioColor && textColor.id === 'default')
                              ? "ring-2 ring-offset-2 ring-slate-400 scale-110"
                              : "hover:scale-105"
                              } ${textColor.id === 'white' ? 'bg-slate-800' : 'bg-white'}`}
                            title={textColor.name}
                          >
                            <span className={textColor.class} style={textColor.style}>Aa</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Selector */}
                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground border-b pb-2">
                    Background Pattern
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    {BACKGROUND_PATTERNS.map((pattern) => (
                      <button
                        key={pattern.id}
                        onClick={() => onUpdatePage?.({ backgroundPattern: pattern.id })}
                        className={`relative h-16 sm:h-20 rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${page?.backgroundPattern === pattern.id
                          ? "border-slate-900 ring-2 ring-offset-2 ring-slate-300"
                          : "border-slate-200 hover:border-slate-300"
                          }`}
                        title={pattern.name}
                      >
                        {/* Preview background */}
                        <div
                          className={`absolute inset-0 ${pattern.bgClass || "bg-white"}`}
                          style={
                            pattern.pattern
                              ? {
                                backgroundColor: pattern.preview === "white" ? "white" : pattern.preview,
                                backgroundImage: `url("${pattern.pattern}")`,
                                backgroundSize: "40px 40px",
                              }
                              : {}
                          }
                        />
                        {/* Label */}
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors flex items-center justify-center">
                          <span className="text-[9px] sm:text-xs font-medium text-slate-700 bg-white/80 px-2 py-1 rounded text-center">
                            {pattern.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Random Gradient Button */}
                  <Button
                    onClick={() => {
                      const angles = ["to right", "to left", "to top", "to bottom", "to top right", "to top left", "to bottom right", "to bottom left", "135deg", "45deg", "225deg", "315deg"];
                      const colorSets = [
                        ["#ef4444", "#f97316", "#eab308"],
                        ["#ec4899", "#f43f5e", "#ef4444"],
                        ["#a855f7", "#8b5cf6", "#6366f1"],
                        ["#3b82f6", "#06b6d4", "#14b8a6"],
                        ["#22c55e", "#10b981", "#14b8a6"],
                        ["#f59e0b", "#f97316", "#ef4444"],
                        ["#d946ef", "#a855f7", "#8b5cf6"],
                        ["#06b6d4", "#3b82f6", "#6366f1"],
                        ["#84cc16", "#22c55e", "#10b981"],
                        ["#f43f5e", "#ec4899", "#d946ef"],
                        ["#0ea5e9", "#3b82f6", "#6366f1"],
                        ["#6366f1", "#a855f7", "#ec4899"],
                      ];
                      const angle = angles[Math.floor(Math.random() * angles.length)];
                      const colors = colorSets[Math.floor(Math.random() * colorSets.length)];
                      const gradientCss = `linear-gradient(${angle}, ${colors.join(", ")})`;
                      onUpdatePage?.({ backgroundPattern: `custom-gradient:${gradientCss}` });
                    }}
                    variant="outline"
                    className="w-full mt-2 gap-2 text-xs sm:text-sm border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 21h5v-5" />
                    </svg>
                    Random Tailwind Gradient
                  </Button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 border-b pb-2 text-red-500">
                    Danger Zone
                  </h3>
                  <div className="pt-2">
                    <p className="text-[10px] sm:text-xs text-red-600 mb-2 font-medium">
                      ⚠️ Changing the slug will break existing links to this page.
                    </p>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Slug Baru</Label>
                      <div className="relative">
                        <Input
                          value={slugInput}
                          onChange={(e) => {
                            const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                            setSlugInput(val);
                            // We don't call onUpdatePage directly here because we want to validate first
                          }}
                          className={`font-mono text-[10px] sm:text-xs pr-10 ${isSlugAvailable === false ? "border-red-500 focus-visible:ring-red-500" :
                            isSlugAvailable === true ? "border-green-500 focus-visible:ring-green-500" : ""
                            }`}
                          placeholder="new-slug-name"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                          {isCheckingSlug && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                          )}
                          {!isCheckingSlug && isSlugAvailable === true && (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          )}
                          {!isCheckingSlug && isSlugAvailable === false && (
                            <X className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                      </div>

                      {isSlugAvailable === false && (
                        <p className="text-[10px] text-red-500 mt-1">This slug is already taken.</p>
                      )}
                      {isSlugAvailable === true && (
                        <p className="text-[10px] text-green-600 mt-1">This slug is available!</p>
                      )}

                      {slugInput !== page?.slug && isSlugAvailable === true && (
                        <Button
                          className="w-full text-[10px] h-8 mt-2"
                          onClick={() => setShowSlugConfirm(true)}
                        >
                          Confirm New Slug
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <ConfirmDialog
        open={showSlugConfirm}
        onOpenChange={setShowSlugConfirm}
        onConfirm={() => {
          onUpdatePage?.({ slug: slugInput });
          setShowSlugConfirm(false);
        }}
        title="Change Slug"
        description="Are you sure? Changing the slug will break existing links to this page."
        confirmText="Change Slug"
      />

      {/* Right Panel: Preview */}
      <div className="w-full lg:flex-1 lg:sticky lg:top-4 lg:h-fit flex flex-col p-4 lg:p-6 bg-card rounded-xl border border-border shadow-sm">

        <div className="w-full flex flex-col lg:flex-col items-center gap-3 lg:gap-4">
          {/* URL Indicator */}
          <div className="w-full max-w-[280px] sm:max-w-[320px] flex items-center justify-center gap-2 bg-card px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-border text-[10px] sm:text-xs font-medium text-muted-foreground shadow-sm flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <span className="truncate text-center">rsai.click/{page?.slug || "your-page"}</span>
          </div>

          {/* Mobile Frame Container - Responsive */}
          <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] bg-slate-900 rounded-[1.5rem] sm:rounded-[2rem] p-1.5 sm:p-2 shadow-xl sm:shadow-2xl border-[5px] sm:border-[6px] border-slate-800 overflow-hidden ring-1 ring-slate-900/5 flex-shrink-0">
            {/* Front Camera / Notch */}
            <div className="absolute z-50 top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-4 sm:h-5 bg-slate-800 rounded-b-2xl flex items-center justify-center">
              <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-slate-900 mr-1 sm:mr-1.5" />
              <div className="w-6 sm:w-8 h-0.5 rounded-full bg-slate-700/50" />
            </div>

            {/* Content Area */}
            <div className="w-full h-full bg-white rounded-[1.5rem] overflow-hidden relative">
              {/* Preview Content */}
              <PreviewContent key={previewKey} page={page} onShare={handleShare} />
            </div>
          </div>

          {/* Share Button */}
          <div className="w-full flex items-center justify-center gap-2 sm:gap-3 flex-shrink-0 relative">
            {shareToast.show && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-3 py-2 rounded-lg text-xs sm:text-sm whitespace-nowrap shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
                {shareToast.message}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="rounded-full px-3 sm:px-5 text-xs sm:text-sm text-muted-foreground border-border bg-card hover:bg-muted shadow-sm transition-colors"
            >
              <Share2 size={16} className="sm:w-6 sm:h-6" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewContent({ page, onShare }: { page: any; onShare?: () => void }) {
  // Check for custom gradient stored in backgroundPattern
  const isCustomGradient = page?.backgroundPattern?.startsWith('custom-gradient:');
  const customGradientCss = isCustomGradient ? page.backgroundPattern.replace('custom-gradient:', '') : null;
  const bgPattern = isCustomGradient ? null : (BACKGROUND_PATTERNS.find(p => p.id === page?.backgroundPattern) || BACKGROUND_PATTERNS[0]);

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center text-center overflow-y-auto ${bgPattern?.bgClass || ""}`}
      style={
        customGradientCss
          ? { background: customGradientCss }
          : bgPattern?.pattern
            ? {
              backgroundColor: bgPattern.preview === "white" ? "white" : bgPattern.preview,
              backgroundImage: `url("${bgPattern.pattern}")`,
              backgroundSize: "40px 40px",
            }
            : {}
      }
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 px-3 pt-3 flex-shrink-0">
        <div className="w-full flex items-center justify-between px-3 sm:px-4 py-1.5 bg-white/50 backdrop-blur border border-white/30 rounded-full shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <img src="/rsai-click-new-icon-only.png" alt="Logo" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
            <span className="text-[10px] sm:text-xs font-bold text-secondary/80">RSAI Click</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-white/20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onShare?.();
            }}
          >
            <Share2 size={14} className="text-secondary/80" />
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full space-y-4 sm:space-y-6 md:space-y-8 px-4 sm:px-6 md:px-8 mt-4 sm:mt-6 md:mt-8">
        {/* Avatar */}
        <div className="w-14 sm:w-16 md:w-20 h-14 sm:h-16 md:h-20 rounded-full bg-slate-200 mx-auto border-2 border-white shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0">
          {page?.avatarUrl ? (
            <img
              src={page.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={24} className="sm:w-8 sm:h-8 text-slate-400" />
          )}
        </div>

        <div className="space-y-0.5 sm:space-y-1">
          <h2 className={`text-sm sm:text-base md:text-lg font-bold line-clamp-2 ${page?.titleColor && page.titleColor !== "default"
            ? TEXT_COLORS.find(c => c.id === page.titleColor)?.class || "text-foreground"
            : (page?.textColor && page.textColor !== "default" ? TEXT_COLORS.find(c => c.id === page.textColor)?.class : "text-foreground")
            }`} style={page?.titleColor && page.titleColor !== "default" ? TEXT_COLORS.find(c => c.id === page.titleColor)?.style : (page?.textColor && page.textColor !== "default" ? TEXT_COLORS.find(c => c.id === page.textColor)?.style : {})}>
            {page?.title || "Page Title"}
          </h2>
          <p className={`text-[10px] sm:text-xs md:text-xs px-2 line-clamp-2 ${page?.bioColor && page.bioColor !== "default"
            ? TEXT_COLORS.find(c => c.id === page.bioColor)?.class || "text-muted-foreground"
            : (page?.textColor && page.textColor !== "default" ? TEXT_COLORS.find(c => c.id === page.textColor)?.class : "text-muted-foreground")
            }`} style={page?.bioColor && page.bioColor !== "default" ? TEXT_COLORS.find(c => c.id === page.bioColor)?.style : (page?.textColor && page.textColor !== "default" ? TEXT_COLORS.find(c => c.id === page.textColor)?.style : {})}>
            {page?.bio || "Welcome to my microsite"}
          </p>
        </div>

        {/* Links */}
        <div className="space-y-1.5 sm:space-y-2 pt-1 w-full px-1">
          {page?.links?.map((link: any) => {
            const IconComponent = link.icon ? ICON_MAP[link.icon] : Link;
            // Fix: Properly handle both textColor and text_color field names
            const textColorId = link.textColor ?? link.text_color ?? "default";
            const colorId = link.color ?? "default";
            const colorStyles = getButtonStyles(colorId, textColorId);

            let customIcon = null;
            try {
              if (link.customIcon) {
                customIcon = typeof link.customIcon === 'string' ? JSON.parse(link.customIcon) : link.customIcon;
              }
            } catch (e) {
              customIcon = null;
            }

            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2 sm:py-2.5 md:py-3 px-2.5 sm:px-3 md:px-4 rounded-md sm:rounded-lg md:rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-medium hover:scale-[1.02] transition-transform ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border}`}
                style={colorStyles.textStyle as any}
              >
                {customIcon?.type === 'emoji' && (
                  <span className="text-sm sm:text-base md:text-lg">{customIcon.value}</span>
                )}
                {customIcon?.type === 'image' && (
                  <img src={customIcon.value} alt="" className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 object-contain" />
                )}
                {!customIcon && link.icon && (
                  <IconComponent size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                )}
                {!customIcon && !link.icon && (
                  <Link size={12} className="sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                )}
                <span className="line-clamp-1">{link.title}</span>
                <ExternalLink size={8} className="opacity-50 flex-shrink-0 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
              </a>
            );
          })}

          {(!page?.links || page.links.length === 0) && (
            <div className="space-y-1.5 sm:space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full h-7 sm:h-9 md:h-11 bg-white/10 rounded-md sm:rounded-lg md:rounded-xl border border-dashed border-white/20"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pb-4 sm:pb-6 px-4">
        <div className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/50 backdrop-blur rounded-full border border-white/30 shadow-sm text-center mx-auto w-fit">
          <span className="text-[7px] sm:text-[9px] md:text-[10px] text-secondary/50">Powered by</span>
          <span className="text-[7px] sm:text-[9px] md:text-[10px] font-bold text-secondary">
            RSAI Click
          </span>
        </div>
      </div>
    </div>
  );
}
