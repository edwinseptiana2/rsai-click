"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, User, Link, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICON_MAP, getButtonStyles } from "@/components/microsite/button-templates";

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
  const [previewKey, setPreviewKey] = React.useState(0);
  
  React.useEffect(() => {
    setPreviewKey(k => k + 1);
  }, [page?.links]);

  return (
    <div className="flex h-[calc(100vh-120px)] w-full gap-8 overflow-hidden">
      {/* Left Panel: Editor */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Tabs defaultValue="components" className="flex-1 flex flex-col">
          <div className="px-6 pt-6 pb-4 border-b border-slate-100">
            <TabsList className="grid w-full grid-cols-2 h-11 p-1 bg-slate-100/50 rounded-lg">
              <TabsTrigger
                value="components"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Components
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <TabsContent
              value="components"
              className="mt-0 space-y-6 focus-visible:outline-none"
            >
              <Button
                onClick={onAddLink}
                className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-lg font-semibold gap-2"
              >
                <Plus size={20} />
                Add new component
              </Button>

              <div className="space-y-4">
                {/* Component List will go here */}
                {children}
              </div>
            </TabsContent>

            <TabsContent
              value="settings"
              className="mt-0 space-y-6 focus-visible:outline-none"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">
                    Profile
                  </h3>
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="page-title">Title</Label>
                      <Input
                        id="page-title"
                        value={page?.title || ""}
                        onChange={(e) =>
                          onUpdatePage?.({ title: e.target.value })
                        }
                        placeholder="Enter page title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="page-bio">Bio</Label>
                      <textarea
                        id="page-bio"
                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={page?.bio || ""}
                        onChange={(e) =>
                          onUpdatePage?.({ bio: e.target.value })
                        }
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-900 border-b pb-2 text-red-500">
                    Danger Zone
                  </h3>
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 mb-2">
                      Changing the slug will break existing links.
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={page?.slug || ""}
                        onChange={(e) =>
                          onUpdatePage?.({ slug: e.target.value })
                        }
                        className="font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Right Panel: Preview */}
      <div className="hidden lg:flex w-[400px] flex-col items-center justify-center p-8 bg-slate-50/50 rounded-xl border border-slate-200/60 transition-all">
        <div className="sticky top-0 w-full flex flex-col items-center">
          <div className="mb-4 flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 text-xs font-medium text-slate-600 shadow-sm max-w-full truncate">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            rsai.click/{page?.slug || "your-page"}
          </div>

          {/* Mobile Frame Container */}
          <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-[8px] border-slate-800 overflow-hidden ring-1 ring-slate-900/5">
            {/* Front Camera / Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
              <div className="w-12 h-1 rounded-full bg-slate-700/50" />
            </div>

            {/* Content Area (Iframe or Local Component) */}
            <div className="w-full h-full bg-white rounded-[2.2rem] overflow-hidden relative">
              {/* Preview Content */}
              <PreviewContent key={previewKey} page={page} />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-5 text-slate-600 border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewContent({ page }: { page: any }) {
  return (
    <div className="absolute inset-0 p-6 flex flex-col items-center text-center">
      {/* Background (Dynamic based on theme) */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-emerald-50 -z-10" />

      <div className="mt-8 space-y-4 w-full">
        <div className="w-20 h-20 rounded-full bg-slate-200 mx-auto border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
          {page?.avatarUrl ? (
            <img
              src={page.avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={40} className="text-slate-400" />
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900">
            {page?.title || "Page Title"}
          </h2>
          <p className="text-xs text-slate-500 px-4 line-clamp-2">
            {page?.bio || "Welcome to my microsite"}
          </p>
        </div>

        <div className="space-y-3 pt-4 w-full px-2">
          {page?.links?.map((link: any) => {
            const IconComponent = link.icon ? ICON_MAP[link.icon] : Link;
            const textColorValue = link.textColor || (link as any).text_color || "default";
            const colorStyles = getButtonStyles(link.color || "default", textColorValue);
            
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
                className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium hover:scale-[1.02] transition-transform ${colorStyles.bg} ${colorStyles.text} ${colorStyles.border}`}
              >
                {customIcon?.type === 'emoji' && (
                  <span className="text-lg">{customIcon.value}</span>
                )}
                {customIcon?.type === 'image' && (
                  <img src={customIcon.value} alt="" className="w-4 h-4 object-contain" />
                )}
                {!customIcon && link.icon && (
                  <IconComponent size={16} />
                )}
                {!customIcon && !link.icon && (
                  <Link size={16} />
                )}
                {link.title}
                <ExternalLink size={12} className="opacity-50" />
              </a>
            );
          })}

          {(!page?.links || page.links.length === 0) && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-full h-11 bg-slate-100/50 rounded-xl border border-dashed border-slate-200"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pb-4">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur rounded-full border border-slate-200/50 shadow-sm">
          <span className="text-[10px] text-slate-400">Powered by</span>
          <span className="text-[10px] font-bold text-slate-600">
            RSAI Click
          </span>
        </div>
      </div>
    </div>
  );
}
