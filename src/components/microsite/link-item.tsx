import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Trash2,
  MoreVertical,
  Link,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ICON_MAP, getButtonStyles } from "@/components/microsite/button-templates";

export function LinkItem({
  link,
  onToggle,
  onDelete,
  onEdit,
}: {
  link: any;
  onToggle?: (active: boolean) => void;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

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
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-card border border-border rounded-xl hover:shadow-md transition-all duration-200 overflow-hidden min-w-0 ${isDragging ? "shadow-lg border-blue-200 ring-2 ring-blue-100" : ""
        }`}
    >
      {/* <div className="p-4 flex items-center gap-4 min-w-0 "> */}
      <div className="p-4 grid grid-cols-[auto_auto_1fr_auto] items-center gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-slate-300 hover:text-slate-400 transition-colors"
        >
          <GripVertical size={20} />
        </div>

        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorStyles.bg} ${colorStyles.text}`}>
          {customIcon?.type === 'emoji' && (
            <span className="text-xl">{customIcon.value}</span>
          )}
          {customIcon?.type === 'image' && (
            <img src={customIcon.value} alt="" className="w-6 h-6 object-contain" />
          )}
          {!customIcon && (link.icon ? <IconComponent size={20} /> : <Link size={20} />)}
        </div>

        <div className="flex-1 min-w-0 overflow-hidden cursor-pointer" onClick={onEdit}>
          <h3 className="text-sm font-semibold text-foreground truncate">
            {link.title || "Untitled Link"}
          </h3>
          <p className="text-xs text-slate-400 truncate break-all">
            {link.url || "No URL"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Switch
            checked={link.isActive}
            onCheckedChange={onToggle}
            className="data-[state=checked]:bg-green-500"
          />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
              onClick={onDelete}
            >
              <Trash2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-600"
              onClick={onEdit}
            >
              <MoreVertical size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
