import { 
  Link, 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  ShoppingCart, 
  BookOpen, 
  Video, 
  Music, 
  Gamepad2,
  ExternalLink,
  ArrowRight,
  Star,
  Heart,
  Zap
} from "lucide-react";

export const BUTTON_TEMPLATES = [
  {
    id: "default",
    name: "Default",
    icon: "Link",
    color: "default",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "Instagram",
    color: "pink",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: "Youtube",
    color: "red",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: "Twitter",
    color: "black",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "Linkedin",
    color: "blue",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "Github",
    color: "gray",
  },
  {
    id: "email",
    name: "Email",
    icon: "Mail",
    color: "blue",
  },
  {
    id: "phone",
    name: "Phone",
    icon: "Phone",
    color: "green",
  },
  {
    id: "location",
    name: "Location",
    icon: "MapPin",
    color: "red",
  },
  {
    id: "website",
    name: "Website",
    icon: "Globe",
    color: "blue",
  },
  {
    id: "shop",
    name: "Shop",
    icon: "ShoppingCart",
    color: "orange",
  },
  {
    id: "blog",
    name: "Blog",
    icon: "BookOpen",
    color: "purple",
  },
  {
    id: "video",
    name: "Video",
    icon: "Video",
    color: "red",
  },
  {
    id: "music",
    name: "Music",
    icon: "Music",
    color: "pink",
  },
  {
    id: "gaming",
    name: "Gaming",
    icon: "Gamepad2",
    color: "purple",
  },
];

export const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Link,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  Github,
  Mail,
  Phone,
  MapPin,
  Globe,
  ShoppingCart,
  BookOpen,
  Video,
  Music,
  Gamepad2,
  ExternalLink,
  ArrowRight,
  Star,
  Heart,
  Zap,
};

export const BUTTON_COLORS = [
  { id: "default", name: "Default", bg: "bg-white", text: "text-slate-700", border: "border-slate-200" },
  { id: "black", name: "Black", bg: "bg-slate-900", text: "text-white", border: "border-slate-900" },
  { id: "white", name: "White", bg: "bg-white", text: "text-slate-900", border: "border-slate-200" },
  { id: "gray", name: "Gray", bg: "bg-slate-500", text: "text-white", border: "border-slate-500" },
  { id: "red", name: "Red", bg: "bg-red-500", text: "text-white", border: "border-red-500" },
  { id: "orange", name: "Orange", bg: "bg-orange-500", text: "text-white", border: "border-orange-500" },
  { id: "amber", name: "Amber", bg: "bg-amber-500", text: "text-white", border: "border-amber-500" },
  { id: "yellow", name: "Yellow", bg: "bg-yellow-400", text: "text-yellow-900", border: "border-yellow-400" },
  { id: "lime", name: "Lime", bg: "bg-lime-500", text: "text-white", border: "border-lime-500" },
  { id: "green", name: "Green", bg: "bg-green-500", text: "text-white", border: "border-green-500" },
  { id: "emerald", name: "Emerald", bg: "bg-emerald-500", text: "text-white", border: "border-emerald-500" },
  { id: "teal", name: "Teal", bg: "bg-teal-500", text: "text-white", border: "border-teal-500" },
  { id: "cyan", name: "Cyan", bg: "bg-cyan-500", text: "text-white", border: "border-cyan-500" },
  { id: "sky", name: "Sky", bg: "bg-sky-500", text: "text-white", border: "border-sky-500" },
  { id: "blue", name: "Blue", bg: "bg-blue-500", text: "text-white", border: "border-blue-500" },
  { id: "indigo", name: "Indigo", bg: "bg-indigo-500", text: "text-white", border: "border-indigo-500" },
  { id: "violet", name: "Violet", bg: "bg-violet-500", text: "text-white", border: "border-violet-500" },
  { id: "purple", name: "Purple", bg: "bg-purple-500", text: "text-white", border: "border-purple-500" },
  { id: "fuchsia", name: "Fuchsia", bg: "bg-fuchsia-500", text: "text-white", border: "border-fuchsia-500" },
  { id: "pink", name: "Pink", bg: "bg-pink-500", text: "text-white", border: "border-pink-500" },
  { id: "rose", name: "Rose", bg: "bg-rose-500", text: "text-white", border: "border-rose-500" },
];

export const TEXT_COLORS = [
  { id: "default", name: "Default", class: "text-inherit", style: {} },
  { id: "white", name: "White", class: "text-white", style: { color: "white" } },
  { id: "black", name: "Black", class: "text-black", style: { color: "black" } },
  { id: "slate", name: "Slate", class: "text-slate-700", style: { color: "#3f3f46" } },
  { id: "gray", name: "Gray", class: "text-gray-700", style: { color: "#374151" } },
  { id: "red", name: "Red", class: "text-red-600", style: { color: "#dc2626" } },
  { id: "orange", name: "Orange", class: "text-orange-600", style: { color: "#ea580c" } },
  { id: "yellow", name: "Yellow", class: "text-yellow-600", style: { color: "#ca8a04" } },
  { id: "green", name: "Green", class: "text-green-600", style: { color: "#16a34a" } },
  { id: "teal", name: "Teal", class: "text-teal-600", style: { color: "#0d9488" } },
  { id: "blue", name: "Blue", class: "text-blue-600", style: { color: "#2563eb" } },
  { id: "indigo", name: "Indigo", class: "text-indigo-600", style: { color: "#4f46e5" } },
  { id: "purple", name: "Purple", class: "text-purple-600", style: { color: "#9333ea" } },
  { id: "pink", name: "Pink", class: "text-pink-600", style: { color: "#db2777" } },
];

export function getButtonStyles(colorId: string, textColorId: string = "default") {
  const color = BUTTON_COLORS.find(c => c.id === colorId) || BUTTON_COLORS[0];
  
  // Ensure we use the provided textColorId, not default from button color
  let textColor = color.text; // fallback
  let textStyle: any = {};
  
  if (textColorId && textColorId !== "default") {
    const customText = TEXT_COLORS.find(c => c.id === textColorId);
    if (customText) {
      textColor = customText.class;
      textStyle = customText.style || {};
      console.log(`[getButtonStyles] Found custom text color "${textColorId}": ${textColor}`);
    } else {
      console.log(`[getButtonStyles] Custom text color "${textColorId}" NOT FOUND in TEXT_COLORS`);
    }
  } else {
    console.log(`[getButtonStyles] Using default text color from button: ${textColor}`);
  }
  
  const result = { 
    ...color, 
    text: textColor,
    textStyle: textStyle
  };
  console.log(`[getButtonStyles] Final result:`, { colorId, textColorId, text: textColor, bg: color.bg, textStyle });
  return result;
}

export function getIconComponent(iconName: string | null) {
  if (!iconName) return Link;
  return ICON_MAP[iconName] || Link;
}
