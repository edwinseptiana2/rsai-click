import React, { useState } from "react";
import { EditorShell } from "@/components/microsite/editor-shell";
import { LinkItem } from "@/components/microsite/link-item";
import { getPageById, updatePage } from "@/server/pages";
import {
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
} from "@/server/links";
import { useServerFn } from "@tanstack/react-start";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BUTTON_TEMPLATES, BUTTON_COLORS, TEXT_COLORS, ICON_MAP, getButtonStyles } from "@/components/microsite/button-templates";
import { toast } from "sonner";

export function MicrositeEditor({ pageId }: { pageId: number }) {
  const [page, setPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const createLinkFn = useServerFn(createLink) as any;
  const updateLinkFn = useServerFn(updateLink) as any;
  const deleteLinkFn = useServerFn(deleteLink) as any;
  const reorderLinksFn = useServerFn(reorderLinks) as any;
  const updatePageFn = useServerFn(updatePage) as any;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  React.useEffect(() => {
    async function load() {
      try {
        console.log("Loading page with ID:", pageId);
        const data = await getPageById({ data: pageId as any });
        console.log("Page loaded:", data);
        setPage(data);
      } catch (err: any) {
        console.error("Error loading page:", err);
        setError(err?.message || "Failed to load page");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [pageId]);

  if (isLoading) return <div className="p-8 text-center">Loading editor...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!page) return <div className="p-8 text-center">Page not found</div>;

  const handleToggleLink = async (linkId: number, active: boolean) => {
    setPage((prev: any) => ({
      ...prev,
      links: prev.links.map((l: any) =>
        l.id === linkId ? { ...l, isActive: active } : l,
      ),
    }));

    try {
      await updateLinkFn({ data: { id: linkId, isActive: active } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    setPage((prev: any) => ({
      ...prev,
      links: prev.links.filter((l: any) => l.id !== linkId),
    }));

    try {
      await deleteLinkFn({ data: { id: linkId } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddLink = async (template?: { icon: string; color: string }) => {
    const title = "New Link";
    const url = "https://";
    const icon = template?.icon || null;
    const color = template?.color || "default";
    const textColor = "default";

    try {
      const result = await createLinkFn({
        data: {
          pageId,
          title,
          url,
          icon,
          color,
          textColor,
          position: page.links.length,
        },
      });
      const id = result.id;

      setPage((prev: any) => ({
        ...prev,
        links: [
          ...prev.links,
          { id, title, url, icon, color, textColor, position: prev.links.length, isActive: true },
        ],
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePage = async (updates: any) => {
    const previousPage = { ...page };
    // Optimistically update the UI
    setPage((prev: any) => ({ ...prev, ...updates }));
    
    try {
      await updatePageFn({ data: { id: pageId, ...updates } });
      // On success, we can show a brief success toast if needed, but usually silent is better for micro-updates
    } catch (err: any) {
      console.error("Update failed:", err);
      // Revert state on error
      setPage(previousPage);
      
      const errorMessage = err?.message || "Failed to update page";
      toast.error(errorMessage);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = page.links.findIndex((l: any) => l.id === active.id);
      const newIndex = page.links.findIndex((l: any) => l.id === over.id);

      const newLinks = arrayMove(page.links, oldIndex, newIndex);
      setPage((prev: any) => ({ ...prev, links: newLinks }));

      try {
        await reorderLinksFn({
          data: {
            pageId,
            orderedIds: newLinks.map((l: any) => l.id),
          },
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <EditorShell
      page={page}
      onAddLink={() => handleAddLink()}
      onUpdatePage={handleUpdatePage}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={page.links.map((l: any) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {page.links.map((link: any) => (
              <LinkItem
                key={link.id}
                link={link}
                onToggle={(active) => handleToggleLink(link.id, active)}
                onDelete={() => handleDeleteLink(link.id)}
                onEdit={() => {
                  setEditingLink({
                    ...link,
                    textColor: link.textColor || link.text_color || "default",
                  });
                  setIsEditDialogOpen(true);
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>
              Customize your link button appearance
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4">
            <div className="space-y-6">
              {/* Title & URL */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editingLink?.title || ""}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, title: e.target.value })
                    }
                    placeholder="Link title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={editingLink?.url || ""}
                    onChange={(e) =>
                      setEditingLink({ ...editingLink, url: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label>Button Color</Label>
                <div className="grid grid-cols-7 gap-2">
                  {BUTTON_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setEditingLink({ ...editingLink, color: color.id })}
                      className={`w-9 h-9 rounded-lg ${color.bg} border-2 flex items-center justify-center text-xs font-bold transition-all ${
                        editingLink?.color === color.id 
                          ? "ring-2 ring-offset-2 ring-slate-400 scale-110" 
                          : "hover:scale-105"
                      } ${color.id === 'default' ? 'text-slate-700' : 'text-white'}`}
                      title={color.name}
                    >
                      {color.id === "default" ? "D" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color Picker */}
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="grid grid-cols-7 gap-2">
                  {TEXT_COLORS.map((textColor) => (
                    <button
                      key={textColor.id}
                      type="button"
                      onClick={() => setEditingLink({ ...editingLink, textColor: textColor.id })}
                      className={`w-9 h-9 rounded-lg bg-white border-2 flex items-center justify-center text-xs font-bold transition-all ${
                        editingLink?.textColor === textColor.id || (!editingLink?.textColor && textColor.id === 'default')
                          ? "ring-2 ring-offset-2 ring-slate-400 scale-110" 
                          : "hover:scale-105"
                      } ${textColor.class}`}
                      title={textColor.name}
                    >
                      Aa
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-6 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setEditingLink({ ...editingLink, icon: null, customIcon: null })}
                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                      !editingLink?.icon && !editingLink?.customIcon
                        ? "border-slate-400 bg-slate-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    title="No Icon"
                  >
                    <span className="text-xs text-slate-400">None</span>
                  </button>
                  {BUTTON_TEMPLATES.filter(t => t.icon !== "Link").map((template) => {
                    const IconComponent = ICON_MAP[template.icon];
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setEditingLink({ ...editingLink, icon: template.icon, customIcon: null })}
                        className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                          editingLink?.icon === template.icon && !editingLink?.customIcon
                            ? "border-slate-400 bg-slate-100"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        title={template.name}
                      >
                        <IconComponent size={18} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Emoji Icon */}
              <div className="space-y-2">
                <Label>Custom Emoji Icon</Label>
                <div className="flex gap-2">
                  <Input
                    id="customEmoji"
                    value={editingLink?.customIcon?.type === 'emoji' ? editingLink.customIcon.value : ''}
                    onChange={(e) => {
                      const emoji = e.target.value;
                      if (emoji) {
                        setEditingLink({ ...editingLink, icon: null, customIcon: { type: 'emoji', value: emoji } });
                      } else {
                        setEditingLink({ ...editingLink, customIcon: null });
                      }
                    }}
                    placeholder="Enter emoji (e.g. 🚀)"
                    maxLength={2}
                    className="w-24"
                  />
                  {editingLink?.customIcon?.type === 'emoji' && (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border-2 border-slate-400 flex items-center justify-center text-xl">
                      {editingLink.customIcon.value}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Image Icon */}
              <div className="space-y-2">
                <Label>Custom Image Icon (URL)</Label>
                <div className="flex gap-2">
                  <Input
                    id="customImageUrl"
                    value={editingLink?.customIcon?.type === 'image' ? editingLink.customIcon.value : ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      if (url) {
                        setEditingLink({ ...editingLink, icon: null, customIcon: { type: 'image', value: url } });
                      } else {
                        setEditingLink({ ...editingLink, customIcon: null });
                      }
                    }}
                    placeholder="https://example.com/icon.png"
                  />
                  {editingLink?.customIcon?.type === 'image' && (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border-2 border-slate-400 flex items-center justify-center overflow-hidden">
                      <img src={editingLink.customIcon.value} alt="Custom icon" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Templates */}
              <div className="space-y-2">
                <Label>Quick Templates</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BUTTON_TEMPLATES.slice(1, 7).map((template) => {
                    const IconComponent = ICON_MAP[template.icon];
                    const styles = getButtonStyles(template.color);
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => {
                          setEditingLink({
                            ...editingLink,
                            icon: template.icon,
                            color: template.color,
                          });
                        }}
                        className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-xs font-medium transition-all hover:scale-105 ${styles.bg} ${styles.text} ${styles.border}`}
                      >
                        <IconComponent size={14} />
                        {template.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editingLink) return;

                const updatedLink = { ...editingLink };
                console.log("Saving link with textColor:", updatedLink.textColor, "Full link:", updatedLink);
                
                setIsEditDialogOpen(false);

                try {
                  const updateResult = await updateLinkFn({
                    data: {
                      id: updatedLink.id,
                      title: updatedLink.title,
                      url: updatedLink.url,
                      icon: updatedLink.icon,
                      customIcon: updatedLink.customIcon,
                      color: updatedLink.color,
                      textColor: updatedLink.textColor || "default",
                    },
                  });
                  console.log("Update result:", updateResult);
                  
                  // Add small delay to ensure database has committed
                  await new Promise(resolve => setTimeout(resolve, 100));
                  
                  const freshData = await getPageById({ data: pageId });
                  console.log("Fresh data received:", freshData.links.map((l: any) => ({ 
                    id: l.id, 
                    title: l.title, 
                    textColor: l.textColor, 
                    text_color: (l as any).text_color,
                    color: l.color 
                  })));
                  setPage(freshData);
                } catch (err) {
                  console.error("Error saving link:", err);
                }
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {page.links.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
          <p className="text-slate-400 text-sm">
            No components added yet. Click the button above to start.
          </p>
        </div>
      )}
    </EditorShell>
  );
}
