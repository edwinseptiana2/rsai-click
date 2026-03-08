export const BACKGROUND_PATTERNS = [
  {
    id: "gradient-indigo-emerald",
    name: "Indigo & Emerald",
    bgClass: "bg-gradient-to-br from-indigo-50 to-emerald-50",
    preview: "from-indigo-50 to-emerald-50",
  },
  {
    id: "gradient-purple-pink",
    name: "Purple & Pink",
    bgClass: "bg-gradient-to-br from-purple-50 to-pink-50",
    preview: "from-purple-50 to-pink-50",
  },
  {
    id: "gradient-blue-cyan",
    name: "Blue & Cyan",
    bgClass: "bg-gradient-to-br from-blue-50 to-cyan-50",
    preview: "from-blue-50 to-cyan-50",
  },
  {
    id: "gradient-orange-rose",
    name: "Orange & Rose",
    bgClass: "bg-gradient-to-br from-orange-50 to-rose-50",
    preview: "from-orange-50 to-rose-50",
  },
  {
    id: "gradient-green-teal",
    name: "Green & Teal",
    bgClass: "bg-gradient-to-br from-green-50 to-teal-50",
    preview: "from-green-50 to-teal-50",
  },
  {
    id: "gradient-amber-orange",
    name: "Amber & Orange",
    bgClass: "bg-gradient-to-br from-amber-50 to-orange-50",
    preview: "from-amber-50 to-orange-50",
  },
  {
    id: "gradient-slate-blue",
    name: "Slate & Blue",
    bgClass: "bg-gradient-to-br from-slate-50 to-blue-50",
    preview: "from-slate-50 to-blue-50",
  },
  {
    id: "gradient-fuchsia-violet",
    name: "Fuchsia & Violet",
    bgClass: "bg-gradient-to-br from-fuchsia-50 to-violet-50",
    preview: "from-fuchsia-50 to-violet-50",
  },
  {
    id: "pattern-dots-light",
    name: "Light Dots",
    bgClass: "bg-white",
    preview: "white",
    pattern: "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='0' cy='0' r='2'/%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3Ccircle cx='60' cy='0' r='2'/%3E%3Ccircle cx='0' cy='60' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E",
  },
  {
    id: "pattern-waves-light",
    name: "Light Waves",
    bgClass: "bg-white",
    preview: "white",
    pattern: "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 50 Q25 30, 50 50 T100 50' stroke='%23e5e7eb' stroke-width='1' fill='none'/%3E%3Cpath d='M0 60 Q25 40, 50 60 T100 60' stroke='%23e5e7eb' stroke-width='1' fill='none' opacity='0.5'/%3E%3C/svg%3E",
  },
  {
    id: "pattern-grid-light",
    name: "Light Grid",
    bgClass: "bg-white",
    preview: "white",
    pattern: "data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23e5e7eb' stroke-width='1'%3E%3Cpath d='M0 0h40M0 10h40M0 20h40M0 30h40M0 40h40M0 0v40M10 0v40M20 0v40M30 0v40M40 0v40'/%3E%3C/g%3E%3C/svg%3E",
  },
];

export function getBackgroundPattern(patternId: string) {
  return BACKGROUND_PATTERNS.find(p => p.id === patternId) || BACKGROUND_PATTERNS[0];
}

export function getBackgroundStyle(patternId: string) {
  const pattern = getBackgroundPattern(patternId);
  const style: any = {};

  if (pattern.bgClass) {
    // Return class instead of style for gradient
    return { className: pattern.bgClass };
  }

  if (pattern.pattern) {
    style.backgroundColor = pattern.preview === "white" ? "white" : pattern.preview;
    style.backgroundImage = `url("${pattern.pattern}")`;
    style.backgroundSize = "40px 40px";
  }

  return { style };
}
