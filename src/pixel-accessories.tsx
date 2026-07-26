import type { ReactNode } from "react";

export type AccessoryColorSlot = "primary" | "secondary" | "accent";
export type AccessoryColors = Record<AccessoryColorSlot, string>;
export type AccessoryId =
  | "starCrown"
  | "royalCrown"
  | "moonTiara"
  | "flowerCrown"
  | "moonNecklace"
  | "pearlCollar"
  | "bellCharm"
  | "heartPendant"
  | "explorerHat"
  | "sailorCollar"
  | "wizardCape"
  | "partyDress"
  | "cloudDress"
  | "roundGlasses"
  | "starGlasses"
  | "crystalEarring"
  | "pearlEarring"
  | "trustBow"
  | "dottedBow"
  | "ribbonTail"
  | "starCharm"
  | "fishPin"
  | "heartSpark"
  | "bonsaiTree"
  | "oakTree"
  | "pineTree"
  | "bush"
  | "grassTuft"
  | "mushroom"
  | "pixelCloud"
  | "pixelSun"
  | "woodFence"
  | "roundStone"
  | "tinyButterfly"
  | "tinyBird"
  | "flowerSprig"
  | "luckyClover";

export type AccessoryPlacement = {
  x: number;
  y: number;
  scale: number;
  visible: boolean;
  colors: AccessoryColors;
};

type AccessoryDefinition = {
  id: AccessoryId;
  label: string;
  group: string;
  defaultPlacement: Omit<AccessoryPlacement, "visible" | "colors">;
  defaultColors: AccessoryColors;
  render: (colors: AccessoryColors) => ReactNode;
};

export const accessoryColorSlots: Array<{ id: AccessoryColorSlot; label: string }> = [
  { id: "primary", label: "主色" },
  { id: "secondary", label: "辅色" },
  { id: "accent", label: "亮点" },
];

export const accessoryColorPalettes = [
  { label: "金", colors: { primary: "#f3b83f", secondary: "#8b5a24", accent: "#fff3b0" } },
  { label: "莓", colors: { primary: "#ef8f72", secondary: "#c83f46", accent: "#ffc0af" } },
  { label: "海", colors: { primary: "#6fb7b1", secondary: "#2f7b67", accent: "#d7f3ef" } },
  { label: "夜", colors: { primary: "#8fb6e8", secondary: "#102339", accent: "#ffd36e" } },
  { label: "草", colors: { primary: "#9bbb77", secondary: "#3f6c4e", accent: "#ffe5ac" } },
  { label: "紫", colors: { primary: "#c8a2d8", secondary: "#6f4a8f", accent: "#f4d7ff" } },
];

export const accessoryCatalog: AccessoryDefinition[] = [
  {
    id: "starCrown",
    label: "星星冠",
    group: "王冠",
    defaultPlacement: { x: 50, y: 18, scale: 1 },
    defaultColors: { primary: "#f3b83f", secondary: "#8b5a24", accent: "#fff3b0" },
    render: (c) => (
      <svg viewBox="0 0 64 44" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="8" y="24" width="48" height="12" fill={c.primary} />
        <rect x="12" y="18" width="8" height="8" fill={c.accent} />
        <rect x="28" y="8" width="8" height="20" fill={c.accent} />
        <rect x="44" y="18" width="8" height="8" fill={c.accent} />
        <rect x="8" y="34" width="48" height="4" fill={c.secondary} />
        <rect x="16" y="26" width="6" height="6" fill="#c83f46" />
        <rect x="42" y="26" width="6" height="6" fill="#3a8f6a" />
      </svg>
    ),
  },
  {
    id: "royalCrown",
    label: "宝石王冠",
    group: "王冠",
    defaultPlacement: { x: 50, y: 17, scale: 1.05 },
    defaultColors: { primary: "#ffd36e", secondary: "#7a3f1d", accent: "#8fb6e8" },
    render: (c) => (
      <svg viewBox="0 0 72 48" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="10" y="28" width="52" height="12" fill={c.primary} />
        <rect x="14" y="18" width="10" height="12" fill={c.primary} />
        <rect x="31" y="8" width="10" height="22" fill={c.primary} />
        <rect x="48" y="18" width="10" height="12" fill={c.primary} />
        <rect x="10" y="38" width="52" height="4" fill={c.secondary} />
        <rect x="20" y="30" width="8" height="8" fill={c.accent} />
        <rect x="32" y="26" width="8" height="8" fill="#c83f46" />
        <rect x="44" y="30" width="8" height="8" fill="#3a8f6a" />
        <rect x="34" y="12" width="4" height="4" fill="#fffdfa" />
      </svg>
    ),
  },
  {
    id: "moonTiara",
    label: "月亮小冠",
    group: "王冠",
    defaultPlacement: { x: 51, y: 19, scale: 0.95 },
    defaultColors: { primary: "#8fb6e8", secondary: "#102339", accent: "#ffd36e" },
    render: (c) => (
      <svg viewBox="0 0 70 44" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="12" y="30" width="46" height="8" fill={c.primary} />
        <rect x="18" y="24" width="8" height="8" fill={c.primary} />
        <rect x="44" y="24" width="8" height="8" fill={c.primary} />
        <rect x="30" y="12" width="14" height="14" fill={c.accent} />
        <rect x="38" y="10" width="10" height="10" fill="#102339" />
        <rect x="12" y="36" width="46" height="4" fill={c.secondary} />
        <rect x="20" y="32" width="4" height="4" fill="#fffdfa" />
        <rect x="50" y="32" width="4" height="4" fill="#fffdfa" />
      </svg>
    ),
  },
  {
    id: "flowerCrown",
    label: "花花冠",
    group: "王冠",
    defaultPlacement: { x: 50, y: 20, scale: 1 },
    defaultColors: { primary: "#9bbb77", secondary: "#3f6c4e", accent: "#ef8f72" },
    render: (c) => (
      <svg viewBox="0 0 76 40" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="10" y="24" width="56" height="8" fill={c.secondary} />
        {[14, 30, 46, 58].map((x) => (
          <g key={x}>
            <rect x={x} y="12" width="8" height="8" fill={c.accent} />
            <rect x={x - 4} y="16" width="8" height="8" fill={c.primary} />
            <rect x={x + 4} y="16" width="8" height="8" fill={c.primary} />
            <rect x={x} y="20" width="8" height="8" fill="#ffe5ac" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "moonNecklace",
    label: "月亮项链",
    group: "项链",
    defaultPlacement: { x: 50, y: 72, scale: 1 },
    defaultColors: { primary: "#2f7b67", secondary: "#f4c44e", accent: "#ffe7a2" },
    render: (c) => (
      <svg viewBox="0 0 72 42" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="8" y="8" width="8" height="8" fill={c.primary} />
        <rect x="16" y="14" width="8" height="8" fill={c.primary} />
        <rect x="24" y="18" width="8" height="8" fill={c.primary} />
        <rect x="40" y="18" width="8" height="8" fill={c.primary} />
        <rect x="48" y="14" width="8" height="8" fill={c.primary} />
        <rect x="56" y="8" width="8" height="8" fill={c.primary} />
        <rect x="32" y="20" width="8" height="8" fill={c.secondary} />
        <rect x="36" y="24" width="8" height="8" fill={c.secondary} />
        <rect x="40" y="20" width="6" height="6" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "pearlCollar",
    label: "珍珠项圈",
    group: "项链",
    defaultPlacement: { x: 50, y: 70, scale: 1 },
    defaultColors: { primary: "#fffdfa", secondary: "#d7b46a", accent: "#ef8f72" },
    render: (c) => (
      <svg viewBox="0 0 76 36" aria-hidden="true" shapeRendering="crispEdges">
        {[8, 18, 28, 38, 48, 58].map((x) => <rect key={x} x={x} y="12" width="8" height="8" fill={c.primary} />)}
        <rect x="32" y="20" width="12" height="12" fill={c.secondary} />
        <rect x="34" y="22" width="8" height="8" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "bellCharm",
    label: "铃铛项链",
    group: "项链",
    defaultPlacement: { x: 50, y: 70, scale: 0.95 },
    defaultColors: { primary: "#c83f46", secondary: "#ffd36e", accent: "#fff3b0" },
    render: (c) => (
      <svg viewBox="0 0 72 44" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="10" y="10" width="52" height="8" fill={c.primary} />
        <rect x="28" y="18" width="16" height="6" fill={c.secondary} />
        <rect x="24" y="24" width="24" height="14" fill={c.secondary} />
        <rect x="28" y="36" width="16" height="4" fill="#8b5a24" />
        <rect x="34" y="28" width="4" height="6" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "heartPendant",
    label: "爱心吊坠",
    group: "项链",
    defaultPlacement: { x: 50, y: 72, scale: 0.96 },
    defaultColors: { primary: "#8fb6e8", secondary: "#ef6f72", accent: "#ffc0af" },
    render: (c) => (
      <svg viewBox="0 0 72 44" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="12" y="10" width="10" height="8" fill={c.primary} />
        <rect x="22" y="16" width="10" height="8" fill={c.primary} />
        <rect x="40" y="16" width="10" height="8" fill={c.primary} />
        <rect x="50" y="10" width="10" height="8" fill={c.primary} />
        <rect x="30" y="22" width="12" height="12" fill={c.secondary} />
        <rect x="24" y="26" width="8" height="8" fill={c.secondary} />
        <rect x="42" y="26" width="8" height="8" fill={c.secondary} />
        <rect x="34" y="24" width="6" height="6" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "explorerHat",
    label: "探索帽",
    group: "衣帽",
    defaultPlacement: { x: 54, y: 20, scale: 1 },
    defaultColors: { primary: "#c58a3d", secondary: "#4b2a11", accent: "#77b66e" },
    render: (c) => (
      <svg viewBox="0 0 72 48" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="14" y="28" width="44" height="8" fill={c.secondary} />
        <rect x="22" y="16" width="28" height="16" fill={c.primary} />
        <rect x="26" y="10" width="20" height="8" fill={c.accent} />
        <rect x="14" y="36" width="44" height="4" fill="#4b2a11" />
        <rect x="22" y="28" width="28" height="4" fill="#2f7b67" />
        <rect x="48" y="12" width="8" height="6" fill={c.accent} />
        <rect x="56" y="8" width="6" height="6" fill="#9bbb77" />
      </svg>
    ),
  },
  {
    id: "sailorCollar",
    label: "水手领",
    group: "衣服",
    defaultPlacement: { x: 50, y: 78, scale: 1.05 },
    defaultColors: { primary: "#8fb6e8", secondary: "#102339", accent: "#fffdfa" },
    render: (c) => (
      <svg viewBox="0 0 78 52" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="12" y="10" width="54" height="12" fill={c.accent} />
        <rect x="18" y="22" width="18" height="22" fill={c.primary} />
        <rect x="42" y="22" width="18" height="22" fill={c.primary} />
        <rect x="22" y="28" width="10" height="4" fill={c.secondary} />
        <rect x="46" y="28" width="10" height="4" fill={c.secondary} />
        <rect x="34" y="18" width="10" height="28" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "wizardCape",
    label: "魔法披风",
    group: "衣服",
    defaultPlacement: { x: 50, y: 80, scale: 1.08 },
    defaultColors: { primary: "#6f4a8f", secondary: "#102339", accent: "#ffd36e" },
    render: (c) => (
      <svg viewBox="0 0 78 58" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="16" y="10" width="46" height="10" fill={c.secondary} />
        <rect x="20" y="20" width="38" height="26" fill={c.primary} />
        <rect x="14" y="28" width="12" height="18" fill={c.primary} />
        <rect x="52" y="28" width="12" height="18" fill={c.primary} />
        <rect x="28" y="24" width="6" height="6" fill={c.accent} />
        <rect x="46" y="34" width="6" height="6" fill={c.accent} />
        <rect x="20" y="46" width="38" height="6" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "partyDress",
    label: "派对裙",
    group: "衣服",
    defaultPlacement: { x: 50, y: 82, scale: 1.08 },
    defaultColors: { primary: "#ef8f72", secondary: "#c83f46", accent: "#ffe5ac" },
    render: (c) => (
      <svg viewBox="0 0 82 58" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="28" y="8" width="26" height="12" fill={c.accent} />
        <rect x="22" y="20" width="38" height="16" fill={c.primary} />
        <rect x="16" y="36" width="50" height="12" fill={c.primary} />
        <rect x="10" y="48" width="62" height="6" fill={c.secondary} />
        <rect x="26" y="24" width="6" height="6" fill={c.accent} />
        <rect x="48" y="24" width="6" height="6" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "cloudDress",
    label: "云朵裙",
    group: "衣服",
    defaultPlacement: { x: 50, y: 82, scale: 1.08 },
    defaultColors: { primary: "#8fb6e8", secondary: "#6f4a8f", accent: "#fffdfa" },
    render: (c) => (
      <svg viewBox="0 0 82 56" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="22" y="14" width="38" height="18" fill={c.primary} />
        <rect x="14" y="32" width="54" height="12" fill={c.accent} />
        <rect x="20" y="26" width="12" height="12" fill={c.accent} />
        <rect x="38" y="24" width="14" height="14" fill={c.accent} />
        <rect x="56" y="30" width="10" height="10" fill={c.accent} />
        <rect x="22" y="44" width="38" height="6" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "roundGlasses",
    label: "圆圆眼镜",
    group: "眼镜",
    defaultPlacement: { x: 50, y: 52, scale: 1 },
    defaultColors: { primary: "#102339", secondary: "#8fb6e8", accent: "#fffdfa" },
    render: (c) => (
      <svg viewBox="0 0 82 36" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="8" y="10" width="22" height="4" fill={c.primary} />
        <rect x="8" y="14" width="4" height="14" fill={c.primary} />
        <rect x="26" y="14" width="4" height="14" fill={c.primary} />
        <rect x="8" y="28" width="22" height="4" fill={c.primary} />
        <rect x="52" y="10" width="22" height="4" fill={c.primary} />
        <rect x="52" y="14" width="4" height="14" fill={c.primary} />
        <rect x="70" y="14" width="4" height="14" fill={c.primary} />
        <rect x="52" y="28" width="22" height="4" fill={c.primary} />
        <rect x="30" y="18" width="22" height="4" fill={c.primary} />
        <rect x="14" y="16" width="10" height="10" fill={c.secondary} opacity="0.72" />
        <rect x="58" y="16" width="10" height="10" fill={c.secondary} opacity="0.72" />
        <rect x="18" y="16" width="4" height="4" fill={c.accent} />
        <rect x="62" y="16" width="4" height="4" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "starGlasses",
    label: "星星眼镜",
    group: "眼镜",
    defaultPlacement: { x: 50, y: 52, scale: 0.95 },
    defaultColors: { primary: "#ffd36e", secondary: "#102339", accent: "#ef8f72" },
    render: (c) => (
      <svg viewBox="0 0 88 38" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="12" y="6" width="8" height="8" fill={c.primary} />
        <rect x="8" y="14" width="16" height="8" fill={c.primary} />
        <rect x="12" y="22" width="8" height="8" fill={c.primary} />
        <rect x="4" y="18" width="8" height="8" fill={c.primary} />
        <rect x="24" y="18" width="8" height="8" fill={c.primary} />
        <rect x="68" y="6" width="8" height="8" fill={c.primary} />
        <rect x="64" y="14" width="16" height="8" fill={c.primary} />
        <rect x="68" y="22" width="8" height="8" fill={c.primary} />
        <rect x="60" y="18" width="8" height="8" fill={c.primary} />
        <rect x="80" y="18" width="8" height="8" fill={c.primary} />
        <rect x="32" y="18" width="28" height="4" fill={c.secondary} />
        <rect x="16" y="16" width="4" height="4" fill={c.accent} />
        <rect x="72" y="16" width="4" height="4" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "crystalEarring",
    label: "水晶耳饰",
    group: "耳饰",
    defaultPlacement: { x: 75, y: 42, scale: 0.78 },
    defaultColors: { primary: "#8fb6e8", secondary: "#102339", accent: "#fffdfa" },
    render: (c) => (
      <svg viewBox="0 0 38 52" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="16" y="4" width="6" height="10" fill={c.secondary} />
        <rect x="12" y="14" width="14" height="8" fill={c.accent} />
        <rect x="8" y="22" width="22" height="16" fill={c.primary} />
        <rect x="12" y="38" width="14" height="8" fill={c.secondary} />
        <rect x="14" y="24" width="6" height="6" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "pearlEarring",
    label: "珍珠耳环",
    group: "耳饰",
    defaultPlacement: { x: 25, y: 42, scale: 0.75 },
    defaultColors: { primary: "#fffdfa", secondary: "#d7b46a", accent: "#ef8f72" },
    render: (c) => (
      <svg viewBox="0 0 38 52" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="16" y="6" width="6" height="12" fill={c.secondary} />
        <rect x="12" y="20" width="14" height="14" fill={c.primary} />
        <rect x="16" y="24" width="6" height="6" fill={c.accent} />
        <rect x="10" y="34" width="18" height="6" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "trustBow",
    label: "信任蝴蝶结",
    group: "蝴蝶结",
    defaultPlacement: { x: 30, y: 42, scale: 0.9 },
    defaultColors: { primary: "#ef8f72", secondary: "#c83f46", accent: "#ffc0af" },
    render: (c) => (
      <svg viewBox="0 0 60 44" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="8" y="14" width="16" height="16" fill={c.primary} />
        <rect x="36" y="14" width="16" height="16" fill={c.primary} />
        <rect x="24" y="18" width="12" height="12" fill={c.secondary} />
        <rect x="12" y="18" width="8" height="8" fill={c.accent} />
        <rect x="40" y="18" width="8" height="8" fill={c.accent} />
        <rect x="26" y="20" width="8" height="8" fill="#7e1f2a" />
      </svg>
    ),
  },
  {
    id: "dottedBow",
    label: "圆点蝴蝶结",
    group: "蝴蝶结",
    defaultPlacement: { x: 70, y: 43, scale: 0.9 },
    defaultColors: { primary: "#c8a2d8", secondary: "#6f4a8f", accent: "#fffdfa" },
    render: (c) => (
      <svg viewBox="0 0 64 44" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="8" y="12" width="18" height="18" fill={c.primary} />
        <rect x="38" y="12" width="18" height="18" fill={c.primary} />
        <rect x="26" y="16" width="12" height="12" fill={c.secondary} />
        <rect x="12" y="16" width="5" height="5" fill={c.accent} />
        <rect x="20" y="24" width="5" height="5" fill={c.accent} />
        <rect x="42" y="16" width="5" height="5" fill={c.accent} />
        <rect x="50" y="24" width="5" height="5" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "ribbonTail",
    label: "垂带蝴蝶结",
    group: "蝴蝶结",
    defaultPlacement: { x: 50, y: 75, scale: 0.95 },
    defaultColors: { primary: "#8fb6e8", secondary: "#2f7b67", accent: "#fffdfa" },
    render: (c) => (
      <svg viewBox="0 0 66 58" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="8" y="10" width="18" height="18" fill={c.primary} />
        <rect x="40" y="10" width="18" height="18" fill={c.primary} />
        <rect x="26" y="14" width="14" height="14" fill={c.secondary} />
        <rect x="24" y="28" width="8" height="22" fill={c.primary} />
        <rect x="34" y="28" width="8" height="22" fill={c.primary} />
        <rect x="26" y="32" width="12" height="6" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "starCharm",
    label: "小星星",
    group: "小物",
    defaultPlacement: { x: 74, y: 30, scale: 0.72 },
    defaultColors: { primary: "#ffd36e", secondary: "#8b5a24", accent: "#fff3b0" },
    render: (c) => (
      <svg viewBox="0 0 48 48" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="20" y="4" width="8" height="12" fill={c.primary} />
        <rect x="20" y="32" width="8" height="12" fill={c.primary} />
        <rect x="4" y="20" width="12" height="8" fill={c.primary} />
        <rect x="32" y="20" width="12" height="8" fill={c.primary} />
        <rect x="16" y="16" width="16" height="16" fill={c.primary} />
        <rect x="20" y="18" width="6" height="6" fill={c.accent} />
        <rect x="16" y="32" width="8" height="6" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "fishPin",
    label: "小鱼徽章",
    group: "小物",
    defaultPlacement: { x: 70, y: 62, scale: 0.76 },
    defaultColors: { primary: "#6fb7b1", secondary: "#3a8f6a", accent: "#d7b46a" },
    render: (c) => (
      <svg viewBox="0 0 58 42" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="12" y="14" width="28" height="16" fill={c.primary} />
        <rect x="40" y="10" width="8" height="8" fill={c.secondary} />
        <rect x="40" y="26" width="8" height="8" fill={c.secondary} />
        <rect x="18" y="18" width="6" height="6" fill="#10172a" />
        <rect x="28" y="10" width="8" height="8" fill={c.accent} />
        <rect x="28" y="26" width="8" height="8" fill={c.accent} />
        <rect x="8" y="18" width="6" height="8" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "heartSpark",
    label: "爱心光点",
    group: "小物",
    defaultPlacement: { x: 26, y: 34, scale: 0.72 },
    defaultColors: { primary: "#ef6f72", secondary: "#c83f46", accent: "#ffd36e" },
    render: (c) => (
      <svg viewBox="0 0 60 44" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="20" y="10" width="20" height="20" fill={c.primary} />
        <rect x="14" y="16" width="8" height="8" fill={c.primary} />
        <rect x="38" y="16" width="8" height="8" fill={c.primary} />
        <rect x="24" y="14" width="8" height="8" fill={c.accent} />
        <rect x="24" y="30" width="12" height="8" fill={c.secondary} />
        <rect x="44" y="8" width="6" height="6" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "bonsaiTree",
    label: "小树",
    group: "自然",
    defaultPlacement: { x: 16, y: 78, scale: 0.86 },
    defaultColors: { primary: "#9bbb77", secondary: "#6f3f18", accent: "#ffe5ac" },
    render: (c) => (
      <svg viewBox="0 0 58 64" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="24" y="30" width="10" height="20" fill={c.secondary} />
        <rect x="14" y="12" width="30" height="12" fill={c.primary} />
        <rect x="8" y="22" width="42" height="14" fill={c.primary} />
        <rect x="18" y="6" width="18" height="10" fill={c.primary} />
        <rect x="20" y="46" width="18" height="8" fill={c.accent} />
        <rect x="12" y="54" width="34" height="6" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "tinyBird",
    label: "小鸟",
    group: "自然",
    defaultPlacement: { x: 80, y: 24, scale: 0.75 },
    defaultColors: { primary: "#8fb6e8", secondary: "#102339", accent: "#ffd36e" },
    render: (c) => (
      <svg viewBox="0 0 58 42" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="16" y="14" width="24" height="16" fill={c.primary} />
        <rect x="36" y="10" width="10" height="10" fill={c.primary} />
        <rect x="46" y="16" width="8" height="6" fill={c.accent} />
        <rect x="40" y="14" width="4" height="4" fill={c.secondary} />
        <rect x="8" y="18" width="10" height="8" fill={c.secondary} />
        <rect x="22" y="30" width="4" height="8" fill={c.secondary} />
        <rect x="32" y="30" width="4" height="8" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "oakTree",
    label: "圆冠树",
    group: "自然",
    defaultPlacement: { x: 14, y: 66, scale: 1.05 },
    defaultColors: { primary: "#77b66e", secondary: "#6f3f18", accent: "#a8d47a" },
    render: (c) => (
      <svg viewBox="0 0 76 82" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="32" y="42" width="12" height="28" fill={c.secondary} />
        <rect x="18" y="16" width="40" height="22" fill={c.primary} />
        <rect x="10" y="28" width="56" height="24" fill={c.primary} />
        <rect x="22" y="8" width="32" height="14" fill={c.accent} />
        <rect x="16" y="52" width="44" height="8" fill={c.primary} />
        <rect x="24" y="70" width="28" height="6" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "pineTree",
    label: "松树",
    group: "自然",
    defaultPlacement: { x: 86, y: 66, scale: 1 },
    defaultColors: { primary: "#3f8f62", secondary: "#5a3518", accent: "#9bbb77" },
    render: (c) => (
      <svg viewBox="0 0 66 84" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="28" y="58" width="10" height="18" fill={c.secondary} />
        <rect x="26" y="6" width="14" height="12" fill={c.accent} />
        <rect x="20" y="18" width="26" height="12" fill={c.primary} />
        <rect x="14" y="30" width="38" height="14" fill={c.primary} />
        <rect x="8" y="44" width="50" height="16" fill={c.primary} />
        <rect x="18" y="74" width="30" height="6" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "bush",
    label: "树丛",
    group: "自然",
    defaultPlacement: { x: 18, y: 84, scale: 0.88 },
    defaultColors: { primary: "#77b66e", secondary: "#3f6c4e", accent: "#ffd36e" },
    render: (c) => (
      <svg viewBox="0 0 70 40" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="8" y="22" width="54" height="12" fill={c.secondary} />
        <rect x="12" y="14" width="16" height="16" fill={c.primary} />
        <rect x="27" y="8" width="16" height="22" fill={c.primary} />
        <rect x="42" y="14" width="16" height="16" fill={c.primary} />
        <rect x="18" y="18" width="8" height="8" fill={c.primary} />
        <rect x="44" y="18" width="8" height="8" fill={c.primary} />
        <rect x="20" y="20" width="6" height="6" fill={c.accent} />
        <rect x="44" y="20" width="6" height="6" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "grassTuft",
    label: "草丛",
    group: "自然",
    defaultPlacement: { x: 50, y: 88, scale: 0.74 },
    defaultColors: { primary: "#9bbb77", secondary: "#3f6c4e", accent: "#d7f3a0" },
    render: (c) => (
      <svg viewBox="0 0 58 38" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="6" y="26" width="46" height="6" fill={c.secondary} />
        <rect x="12" y="14" width="6" height="14" fill={c.primary} />
        <rect x="22" y="6" width="6" height="22" fill={c.primary} />
        <rect x="32" y="12" width="6" height="16" fill={c.primary} />
        <rect x="42" y="18" width="6" height="10" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "mushroom",
    label: "蘑菇",
    group: "自然",
    defaultPlacement: { x: 72, y: 84, scale: 0.72 },
    defaultColors: { primary: "#ef6f72", secondary: "#fff3b0", accent: "#8b5a24" },
    render: (c) => (
      <svg viewBox="0 0 50 46" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="14" y="10" width="22" height="10" fill={c.primary} />
        <rect x="8" y="18" width="34" height="10" fill={c.primary} />
        <rect x="18" y="26" width="14" height="14" fill={c.secondary} />
        <rect x="14" y="14" width="6" height="6" fill={c.secondary} />
        <rect x="30" y="18" width="6" height="6" fill={c.secondary} />
        <rect x="16" y="40" width="18" height="4" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "pixelCloud",
    label: "云朵",
    group: "天空",
    defaultPlacement: { x: 24, y: 18, scale: 0.8 },
    defaultColors: { primary: "#fffdfa", secondary: "#8fb6e8", accent: "#d7f3ef" },
    render: (c) => (
      <svg viewBox="0 0 76 38" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="12" y="18" width="50" height="12" fill={c.primary} />
        <rect x="22" y="10" width="18" height="12" fill={c.primary} />
        <rect x="42" y="12" width="14" height="10" fill={c.accent} />
        <rect x="8" y="28" width="58" height="4" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "pixelSun",
    label: "太阳",
    group: "天空",
    defaultPlacement: { x: 82, y: 18, scale: 0.74 },
    defaultColors: { primary: "#ffd36e", secondary: "#ef8f72", accent: "#fff3b0" },
    render: (c) => (
      <svg viewBox="0 0 54 54" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="22" y="4" width="10" height="10" fill={c.primary} />
        <rect x="22" y="40" width="10" height="10" fill={c.primary} />
        <rect x="4" y="22" width="10" height="10" fill={c.primary} />
        <rect x="40" y="22" width="10" height="10" fill={c.primary} />
        <rect x="16" y="16" width="22" height="22" fill={c.primary} />
        <rect x="20" y="20" width="14" height="14" fill={c.accent} />
        <rect x="36" y="36" width="6" height="6" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "woodFence",
    label: "木栅栏",
    group: "自然",
    defaultPlacement: { x: 50, y: 82, scale: 1.05 },
    defaultColors: { primary: "#c58a3d", secondary: "#6f3f18", accent: "#ffe5ac" },
    render: (c) => (
      <svg viewBox="0 0 92 42" aria-hidden="true" shapeRendering="crispEdges">
        {[10, 30, 50, 70].map((x) => (
          <g key={x}>
            <rect x={x} y="8" width="10" height="28" fill={c.primary} />
            <rect x={x} y="4" width="10" height="6" fill={c.accent} />
            <rect x={x} y="34" width="10" height="4" fill={c.secondary} />
          </g>
        ))}
        <rect x="4" y="16" width="82" height="8" fill={c.secondary} />
        <rect x="4" y="28" width="82" height="6" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "roundStone",
    label: "石头",
    group: "自然",
    defaultPlacement: { x: 36, y: 88, scale: 0.7 },
    defaultColors: { primary: "#9aa0a6", secondary: "#5f6670", accent: "#d9dde2" },
    render: (c) => (
      <svg viewBox="0 0 54 34" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="12" y="12" width="30" height="14" fill={c.primary} />
        <rect x="18" y="6" width="20" height="8" fill={c.primary} />
        <rect x="8" y="20" width="38" height="8" fill={c.secondary} />
        <rect x="22" y="10" width="10" height="6" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "tinyButterfly",
    label: "小蝴蝶",
    group: "天空",
    defaultPlacement: { x: 70, y: 28, scale: 0.62 },
    defaultColors: { primary: "#c8a2d8", secondary: "#6f4a8f", accent: "#ffd36e" },
    render: (c) => (
      <svg viewBox="0 0 48 38" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="8" y="10" width="12" height="12" fill={c.primary} />
        <rect x="28" y="10" width="12" height="12" fill={c.primary} />
        <rect x="20" y="14" width="8" height="12" fill={c.secondary} />
        <rect x="10" y="22" width="10" height="8" fill={c.accent} />
        <rect x="28" y="22" width="10" height="8" fill={c.accent} />
      </svg>
    ),
  },
  {
    id: "flowerSprig",
    label: "小花",
    group: "自然",
    defaultPlacement: { x: 20, y: 26, scale: 0.78 },
    defaultColors: { primary: "#ef8f72", secondary: "#3f6c4e", accent: "#ffe5ac" },
    render: (c) => (
      <svg viewBox="0 0 48 58" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="22" y="24" width="6" height="26" fill={c.secondary} />
        <rect x="12" y="12" width="10" height="10" fill={c.primary} />
        <rect x="28" y="12" width="10" height="10" fill={c.primary} />
        <rect x="20" y="4" width="10" height="10" fill={c.primary} />
        <rect x="20" y="20" width="10" height="10" fill={c.primary} />
        <rect x="20" y="12" width="10" height="10" fill={c.accent} />
        <rect x="12" y="36" width="12" height="8" fill={c.secondary} />
        <rect x="28" y="42" width="12" height="8" fill={c.secondary} />
      </svg>
    ),
  },
  {
    id: "luckyClover",
    label: "四叶草",
    group: "自然",
    defaultPlacement: { x: 78, y: 75, scale: 0.76 },
    defaultColors: { primary: "#9bbb77", secondary: "#3f6c4e", accent: "#ffd36e" },
    render: (c) => (
      <svg viewBox="0 0 52 56" aria-hidden="true" shapeRendering="crispEdges">
        <rect x="22" y="26" width="6" height="24" fill={c.secondary} />
        <rect x="12" y="10" width="14" height="14" fill={c.primary} />
        <rect x="26" y="10" width="14" height="14" fill={c.primary} />
        <rect x="12" y="24" width="14" height="14" fill={c.primary} />
        <rect x="26" y="24" width="14" height="14" fill={c.primary} />
        <rect x="22" y="20" width="8" height="8" fill={c.accent} />
      </svg>
    ),
  },
];

export const defaultAccessories = Object.fromEntries(
  accessoryCatalog.map((item) => [
    item.id,
    {
      ...item.defaultPlacement,
      visible: false,
      colors: item.defaultColors,
    },
  ]),
) as Record<AccessoryId, AccessoryPlacement>;

export function getAccessoryLabel(id: AccessoryId) {
  return accessoryCatalog.find((item) => item.id === id)?.label ?? "像素装饰";
}

export function getAccessoryCanvasSize(id: AccessoryId) {
  if (["partyDress", "cloudDress", "wizardCape", "sailorCollar"].includes(id)) return 118;
  if (["oakTree", "pineTree", "bonsaiTree"].includes(id)) return 110;
  if (["starCrown", "royalCrown", "moonTiara", "flowerCrown", "roundGlasses", "starGlasses"].includes(id)) return 92;
  if (["moonNecklace", "pearlCollar", "bellCharm", "heartPendant", "woodFence"].includes(id)) return 86;
  if (["crystalEarring", "pearlEarring", "heartSpark", "starCharm", "fishPin"].includes(id)) return 40;
  if (["tinyBird", "tinyButterfly", "flowerSprig", "luckyClover", "mushroom", "pixelSun"].includes(id)) return 48;
  if (["bush", "grassTuft", "roundStone", "pixelCloud"].includes(id)) return 64;
  return 72;
}

export function AccessoryIcon({ id, colors }: { id: AccessoryId; colors?: AccessoryColors }) {
  const item = accessoryCatalog.find((entry) => entry.id === id) ?? accessoryCatalog[0];
  return item.render(colors ?? item.defaultColors);
}
