"use client";

import { toPng } from "html-to-image";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Download,
  FileText,
  LockKeyhole,
  Moon,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { ChangeEvent, type CSSProperties, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AccessoryIcon,
  accessoryCatalog,
  accessoryColorPalettes,
  accessoryColorSlots,
  getAccessoryCanvasSize,
  getAccessoryLabel,
  type AccessoryColorSlot,
  type AccessoryColors,
  type AccessoryId,
} from "./pixel-accessories";
import { createPixelCatSvgDataUrl } from "./pixel-cat";
import { buildAppCatReport } from "./report/report-adapter";

type DimensionId =
  | "perception"
  | "exploration"
  | "attachment"
  | "social"
  | "autonomy"
  | "stability";

type Question = {
  id: number;
  text: string;
  dimension: DimensionId;
  reverse?: boolean;
};

type ChoiceQuestion = {
  id: number;
  text: string;
  options: Record<string, string>;
  use: string;
};

type Profile = {
  name: string;
  age: string;
  gender: string;
  arrival: string;
  family: string;
};

type Screen = "profile" | "test" | "generating" | "result";
type ResultView = "image" | "report";
type ImageGenerationProvider = "none" | "local-preview" | "ark-seedream" | "stored";

type TestItem =
  | { kind: "core"; question: Question }
  | { kind: "relationship"; question: ChoiceQuestion }
  | { kind: "strategy"; question: ChoiceQuestion }
  | { kind: "safety"; id: number; text: string };

type AccessoryInstance = {
  uid: string;
  accessoryId: AccessoryId;
  x: number;
  y: number;
  scale: number;
  colors: AccessoryColors;
};

type CatLayer = {
  x: number;
  y: number;
  scale: number;
};

const defaultCatLayer: CatLayer = { x: 50, y: 50, scale: 0.82 };

type ActiveCanvasItem =
  | { kind: "cat" }
  | { kind: "accessory"; uid: string }
  | null;

type ResizeGesture = {
  kind: "cat" | "accessory";
  uid?: string;
  startDistance: number;
  startScale: number;
};

type DragOffset = {
  x: number;
  y: number;
};

const ACCESS_CODES = ["CATLAB2026", "MEOW2026", "猫格观测"];

const demoCoreAnswers: Record<number, number | "unknown"> = {
  1: 5, 2: 4, 3: 4, 4: 5, 5: 4, 6: 4, 7: 3, 8: 2,
  9: 5, 10: 4, 11: 5, 12: 4, 13: 5, 14: 5, 15: 1, 16: 1,
  17: 4, 18: 4, 19: 3, 20: 3, 21: 4, 22: 5, 23: 3, 24: 3,
  25: 3, 26: 3, 27: 4, 28: 3, 29: 4, 30: 3, 31: 3, 32: 3,
  33: 5, 34: 5, 35: 5, 36: 4, 37: 4, 38: 5, 39: 2, 40: 3,
  41: 4, 42: 4, 43: 4, 44: 4, 45: 4, 46: 4, 47: 2, 48: 2,
};

const demoRelationshipAnswers: Record<number, string> = {
  49: "A",
  50: "B",
  51: "B",
  52: "B",
  53: "B",
  54: "A",
  55: "B",
  56: "A",
  57: "B",
  58: "B",
  59: "B",
  60: "B",
};

const demoStrategyAnswers: Record<number, string> = {
  61: "E",
  62: "E",
  63: "D",
  64: "B",
  65: "B",
  66: "E",
};

const demoScores: Record<DimensionId, number | null> = {
  perception: 78,
  exploration: 86,
  attachment: 64,
  social: 58,
  autonomy: 72,
  stability: 76,
};

const dimensions: Record<
  DimensionId,
  {
    label: string;
    star: string;
    axis: string;
    low: string;
    mid: string;
    high: string;
    color: string;
    advice: string;
  }
> = {
  perception: {
    label: "感知力",
    star: "月影星",
    axis: "松弛大胆 -> 敏锐谨慎",
    low: "更松弛直率，对日常变化不太紧张。",
    mid: "会根据场景切换警觉和放松。",
    high: "对声音、气味和空间变化很敏锐，需要清晰退路与稳定环境。",
    color: "#d7b46a",
    advice: "给它保留高处观察点和安静退路，访客来时不要催促靠近。",
  },
  exploration: {
    label: "探索力",
    star: "远行星",
    axis: "熟悉偏好 -> 主动探索",
    low: "更喜欢熟悉节奏和稳定布置。",
    mid: "会在安全感足够时探索新鲜事。",
    high: "好奇心强，喜欢研究新空间、新玩具和可解开的谜题。",
    color: "#6fb7b1",
    advice: "用纸箱、嗅闻垫、益智喂食器和垂直空间给它安全探索的机会。",
  },
  attachment: {
    label: "依附力",
    star: "归巢星",
    axis: "独立连接 -> 高频陪伴",
    low: "更常用远距离方式维持连接。",
    mid: "亲近与独处都需要，节奏比较弹性。",
    high: "常主动共享空间、跟随或用身体接触确认关系。",
    color: "#ef8f72",
    advice: "回应它的靠近，但也让它可以自由离开，亲密会更稳定。",
  },
  social: {
    label: "社交力",
    star: "共鸣星",
    axis: "选择性社交 -> 开放社交",
    low: "更偏熟人专属，需要时间审核新关系。",
    mid: "对访客的反应受对方动作、声音和环境影响明显。",
    high: "愿意和更多人建立关系，对温和互动更开放。",
    color: "#8fb6e8",
    advice: "让新朋友保持安静、低姿态、少直视，用零食和距离建立好印象。",
  },
  autonomy: {
    label: "自主力",
    star: "边界星",
    axis: "随和接受 -> 边界清晰",
    low: "对触摸和日常安排更随和。",
    mid: "多数时候能接受互动，也会在不想继续时表达。",
    high: "很重视选择权、身体边界和固定资源。",
    color: "#c8a2d8",
    advice: "让它决定互动开始和结束，尊重尾巴、耳朵、转身这些边界信号。",
  },
  stability: {
    label: "稳定力",
    star: "恒定星",
    axis: "变化迅速 -> 稳定可预测",
    low: "状态切换更快，需求受阻时容易升级表达。",
    mid: "节律大体稳定，特殊情境下会明显波动。",
    high: "反应可预测，兴奋或惊吓后恢复能力较好。",
    color: "#9bbb77",
    advice: "维持规律作息，护理和变化后用安静时间帮助它回到熟悉状态。",
  },
};

const dimensionOrder: DimensionId[] = [
  "perception",
  "exploration",
  "attachment",
  "social",
  "autonomy",
  "stability",
];

const coreQuestions: Question[] = [
  { id: 1, dimension: "perception", text: "门外脚步、陌生声响或物品轻微掉落时，它会很快停下当前行为并判断声音来源。" },
  { id: 2, dimension: "perception", text: "陌生人刚进入家中时，它通常会先拉开距离，在远处观察对方。" },
  { id: 3, dimension: "perception", text: "家中出现新的气味、家具、纸箱或大型物品时，它会反复闻嗅和检查。" },
  { id: 4, dimension: "perception", text: "家具位置、门窗状态或日常动线发生细小变化时，它通常很快能发现。" },
  { id: 5, dimension: "perception", text: "它偏好能够看见房间动线、同时保留退路的观察或休息位置。" },
  { id: 6, dimension: "perception", text: "周围出现意外动作时，即使没有直接靠近它，它也容易中断休息、进食或舔毛。" },
  { id: 7, dimension: "perception", reverse: true, text: "熟悉的人在旁边走动、说话或拿取物品时，它通常仍能在开阔位置完全放松。" },
  { id: 8, dimension: "perception", reverse: true, text: "进入陌生空间后，它往往很快开始进食、玩耍、探索或摊开身体休息。" },
  { id: 9, dimension: "exploration", text: "新的纸箱、袋子、玩具或家具出现时，它通常会主动靠近调查。" },
  { id: 10, dimension: "exploration", text: "房门、柜门或新的可进入区域被打开时，它会想办法进去看看。" },
  { id: 11, dimension: "exploration", text: "即使没有人逗它，它也会主动发起奔跑、攀爬、扑击或模拟捕猎。" },
  { id: 12, dimension: "exploration", text: "它经常选择窗边、高处、角落或新的位置观察环境。" },
  { id: 13, dimension: "exploration", text: "面对益智喂食器、藏起来的零食或暂时拿不到的玩具时，它会尝试不同方法。" },
  { id: 14, dimension: "exploration", text: "第一次没有成功时，它通常还会继续尝试一段时间，而不是立刻放弃。" },
  { id: 15, dimension: "exploration", reverse: true, text: "新玩具或新事物通常只能吸引它很短时间，它很快就不再研究。" },
  { id: 16, dimension: "exploration", reverse: true, text: "它更愿意维持完全不变的日常，很少主动调查环境里出现的新东西。" },
  { id: 17, dimension: "attachment", text: "即使不需要食物、开门或玩耍，它也会主动来到主人附近。" },
  { id: 18, dimension: "attachment", text: "主人坐下、躺下或长时间停留时，它常选择在同一空间或附近休息。" },
  { id: 19, dimension: "attachment", text: "主人离开一段时间回家后，它会主动迎接、靠近、跟随或重新建立接触。" },
  { id: 20, dimension: "attachment", text: "主人从一个房间移动到另一个房间时，它经常会跟随或稍后出现。" },
  { id: 21, dimension: "attachment", text: "它会主动用额头、脸颊、身体或尾巴轻轻蹭主人。" },
  { id: 22, dimension: "attachment", text: "与主人安静互动时，它会出现慢眨眼、眼神放松或柔和回望。" },
  { id: 23, dimension: "attachment", reverse: true, text: "即使主人安静地待在家里、没有主动打扰，它也大部分时间选择远离主人。" },
  { id: 24, dimension: "attachment", reverse: true, text: "除非涉及吃饭、开门或玩具，它很少主动发起与主人的接触。" },
  { id: 25, dimension: "social", text: "陌生人安静坐下一段时间、不主动触碰它时，它会逐渐靠近观察或闻嗅。" },
  { id: 26, dimension: "social", text: "家中来客时，它能够在一段时间后留在同一个空间，而不是始终躲藏。" },
  { id: 27, dimension: "social", text: "除主要照顾者外，它也愿意与其他熟悉家庭成员互动或共享空间。" },
  { id: 28, dimension: "social", text: "由不太熟悉的人喂零食、陪玩或临时照顾时，它能逐渐接受对方。" },
  { id: 29, dimension: "social", text: "同一个访客多次出现后，它通常会比第一次更快放松。" },
  { id: 30, dimension: "social", text: "面对温和伸出的手或轻声呼唤，它会主动闻嗅、抬尾靠近或保持放松姿态。" },
  { id: 31, dimension: "social", reverse: true, text: "只要家里有陌生人，它通常会从开始到结束都保持躲藏或远距离警戒。" },
  { id: 32, dimension: "social", reverse: true, text: "即使对方多次温和来访，它仍然很难表现出放松或主动接近。" },
  { id: 33, dimension: "autonomy", text: "它更喜欢由自己决定什么时候开始和结束抚摸、抱抱或陪玩。" },
  { id: 34, dimension: "autonomy", text: "不想继续被触碰时，它会通过尾巴、耳朵、回头、身体后移或离开表达边界。" },
  { id: 35, dimension: "autonomy", text: "被突然抱起、限制行动或强行调整姿势时，它会明显表示不愿意。" },
  { id: 36, dimension: "autonomy", text: "它需要固定的独处时间，以及不会被人或其他宠物打扰的安全位置。" },
  { id: 37, dimension: "autonomy", text: "它对常用睡觉位置、观察点、抓挠处或个人物品有清晰而稳定的偏好。" },
  { id: 38, dimension: "autonomy", text: "相比被人直接伸手抱住，它更愿意在拥有选择时主动靠近和接触。" },
  { id: 39, dimension: "autonomy", reverse: true, text: "只要是熟悉的人，它通常不介意对方随时抱起、触摸或中断它正在做的事情。" },
  { id: 40, dimension: "autonomy", reverse: true, text: "休息位置、食盆或常用物品被移动后，它通常完全不在意，很快接受新的安排。" },
  { id: 41, dimension: "stability", text: "在相似的环境和情境中，它的反应通常比较一致，主人容易预测。" },
  { id: 42, dimension: "stability", text: "吃饭、开门或获得关注稍微延迟时，它通常能等待一段时间，不会立即升级行为。" },
  { id: 43, dimension: "stability", text: "激烈玩耍或突然兴奋之后，它能够在较短时间内重新安静下来。" },
  { id: 44, dimension: "stability", text: "剪指甲、喂药或其他不喜欢的护理结束后，它通常能较快恢复正常互动。" },
  { id: 45, dimension: "stability", text: "受到惊吓后，只要环境恢复安静，它能够逐渐回到休息、进食、舔毛或探索状态。" },
  { id: 46, dimension: "stability", text: "它每天的活动、休息、进食和互动节奏总体较稳定。" },
  { id: 47, dimension: "stability", reverse: true, text: "它会在没有明显原因的情况下，突然从平静变得非常兴奋、烦躁或强烈反应。" },
  { id: 48, dimension: "stability", reverse: true, text: "需求没有立刻得到满足时，它容易迅速从等待升级为持续叫喊、抓挠、咬人或推物品。" },
];

const relationshipQuestions: ChoiceQuestion[] = [
  {
    id: 49,
    text: "夜里休息时，它最常睡在哪里？",
    use: "陪伴距离、退路偏好、睡眠关系类型",
    options: {
      A: "靠近你的头部、枕头或上半身附近",
      B: "靠近脚边或床尾",
      C: "在同一张床上，但与身体保持一些距离",
      D: "在同一个房间里，但不上床",
      E: "通常在其他房间或固定窝里睡",
    },
  },
  {
    id: 50,
    text: "它睡在你附近时，身体姿态更常是？",
    use: "身体放松程度、亲近方式与安全策略",
    options: {
      A: "紧贴或把身体一部分靠在你身上",
      B: "靠得较近，身体朝向你",
      C: "背对你但距离很近，姿态放松",
      D: "与人保持距离，同时面向房门或动线",
      E: "很少在你附近睡",
    },
  },
  {
    id: 51,
    text: "它是否喜欢睡在你穿过的衣服、被子、枕头或常用物品上？",
    use: "气味熟悉偏好与安全感线索",
    options: { A: "经常主动选择这些物品", B: "比较常见", C: "偶尔会", D: "很少会", E: "几乎没有或未观察过" },
  },
  {
    id: 52,
    text: "你回家时，它最常见的反应是？",
    use: "重逢方式、关系确认节奏",
    options: {
      A: "主动到门口或很快前来迎接",
      B: "在附近观察，随后主动靠近",
      C: "留在原位，但明显关注你的行动",
      D: "反应不明显，按自己的节奏继续活动",
      E: "常先躲开，较久后才出现",
    },
  },
  {
    id: 53,
    text: "你从一个房间走到另一个房间时，它通常会？",
    use: "跟随型、定点守望型或独立型陪伴",
    options: {
      A: "经常立即跟随",
      B: "稍后出现或在关键位置等你",
      C: "只在吃饭、睡觉等特定时段跟随",
      D: "偶尔跟随",
      E: "基本不会跟随",
    },
  },
  {
    id: 54,
    text: "它会主动对你慢眨眼或柔和回望吗？",
    use: "积极放松交流信号",
    options: { A: "经常，且你回应后它仍保持放松", B: "偶尔会", C: "很少会", D: "几乎没有", E: "没有留意过" },
  },
  {
    id: 55,
    text: "它会主动用头、脸颊、身体或尾巴蹭你吗？",
    use: "亲和接触、气味交换、主动社交",
    options: { A: "经常，与吃饭无关时也会", B: "比较常见", C: "主要在吃饭、开门或索取互动时", D: "很少", E: "几乎没有" },
  },
  {
    id: 56,
    text: "它向你走来时，尾巴通常是什么状态？",
    use: "问候姿态与当时情绪背景",
    options: {
      A: "经常竖起，尾端放松或微弯",
      B: "多数自然平举或放松",
      C: "状态不固定",
      D: "经常低垂、夹尾或身体压低",
      E: "没有注意过",
    },
  },
  {
    id: 57,
    text: "你工作、看书或用电脑时，它通常会？",
    use: "共享空间、静默陪伴与注意力策略",
    options: {
      A: "主动贴近、趴在桌边或身体接触",
      B: "在旁边固定位置安静陪伴",
      C: "偶尔出现，确认后离开",
      D: "基本在别处活动",
      E: "会通过挡屏幕、踩键盘等方式争取注意",
    },
  },
  {
    id: 58,
    text: "你安静躺着、情绪低落或身体不舒服时，它通常会？",
    use: "仅描述行为变化，不宣称猫能准确识别人类情绪",
    options: {
      A: "比平时更主动靠近或停留",
      B: "会在附近观察，但不一定接触",
      C: "和平时差不多",
      D: "会离开或减少接近",
      E: "不确定或没有观察过",
    },
  },
  {
    id: 59,
    text: "受到轻微惊吓后，它更常去哪里？",
    use: "安全基地偏好与自我安抚方式",
    options: {
      A: "先靠近你或在你附近停留",
      B: "回到自己的固定安全点",
      C: "躲到家具下或隐蔽处",
      D: "留在原地观察并自行恢复",
      E: "没有固定模式",
    },
  },
  {
    id: 60,
    text: "你呼唤它的名字时，它最常见的反应是？",
    use: "回应风格、利益关联和互动节奏",
    options: {
      A: "很快走过来",
      B: "看向你或发出回应，稍后靠近",
      C: "会注意你，但不一定过来",
      D: "通常没有明显反应",
      E: "主要在有食物、开门或玩具时回应",
    },
  },
];

const strategyQuestions: ChoiceQuestion[] = [
  {
    id: 61,
    text: "想要零食但被拒绝时，它通常会？",
    use: "零食策略",
    options: {
      A: "很快接受，转身做其他事情",
      B: "留在附近安静等待",
      C: "用叫声、蹭人或卖萌再次尝试",
      D: "开始翻找食物、推物品或制造动静",
      E: "暂时离开，之后选择新的时机再次提出",
    },
  },
  {
    id: 62,
    text: "一扇它想进入的门被关上时，它更可能？",
    use: "门禁策略",
    options: {
      A: "发现进不去就离开",
      B: "安静守在门口等待",
      C: "持续叫你或抓门",
      D: "寻找其他入口或解决方法",
      E: "把你引到门边，让你替它打开",
    },
  },
  {
    id: 63,
    text: "主人长时间没有理它时，它通常会？",
    use: "注意力策略",
    options: {
      A: "自己休息或玩耍",
      B: "安静待在主人附近",
      C: "主动蹭人、叫人或踩到主人身上",
      D: "挡屏幕、踩键盘或直接打断工作",
      E: "做一件平时不被允许做的事情",
    },
  },
  {
    id: 64,
    text: "它做了一件不被允许的事情，恰好被发现时，它通常会？",
    use: "规则态度",
    options: {
      A: "马上逃走",
      B: "停下来观察主人的反应",
      C: "假装什么都没有发生",
      D: "开始舔毛、看别处或转移注意力",
      E: "即使被看着也继续做",
    },
  },
  {
    id: 65,
    text: "主人准备出门时，它更常出现哪种反应？",
    use: "出门反应",
    options: {
      A: "没有明显反应",
      B: "在附近观察主人收拾东西",
      C: "跟随主人或守在门口",
      D: "躺在衣服、包或准备带走的物品上",
      E: "快离开时突然撒娇或要求互动",
    },
  },
  {
    id: 66,
    text: "如果它发现某个动作能立刻引起你的注意，之后它会？",
    use: "学习方式",
    options: {
      A: "很少再次这样做",
      B: "偶尔重复，但没有固定规律",
      C: "需要关注时会再次使用",
      D: "逐渐发展成固定的提醒仪式",
      E: "不断尝试新方法测试你的反应",
    },
  },
];

const safetyQuestions = [
  "最近是否突然比过去更容易躲藏、受惊或攻击？",
  "是否突然不愿被触摸，尤其是固定身体部位？",
  "是否出现猫砂盆外排尿/排便、频繁舔同一部位或掉毛？",
  "食欲、饮水、睡眠、活动量或叫声是否明显改变？",
  "多猫家庭是否突然出现堵路、盯视、追赶或资源冲突？",
];

const testItems: TestItem[] = [
  ...coreQuestions.map((question) => ({ kind: "core" as const, question })),
  ...relationshipQuestions.map((question) => ({ kind: "relationship" as const, question })),
  ...strategyQuestions.map((question) => ({ kind: "strategy" as const, question })),
  ...safetyQuestions.map((text, id) => ({ kind: "safety" as const, id, text })),
];

const coreOptions = [
  { value: 1, label: "完全不像" },
  { value: 2, label: "不太像" },
  { value: 3, label: "有一点像" },
  { value: 4, label: "比较像" },
  { value: 5, label: "非常像" },
];

const typeMap: Record<string, { name: string; line: string }> = {
  "attachment|perception": { name: "月影守望者", line: "对世界谨慎，把信任集中留给重要的人。" },
  "exploration|perception": { name: "星雾调查员", line: "敏锐地扫描环境，也无法拒绝新的谜题。" },
  "perception|social": { name: "谨慎外交官", line: "先观察、再靠近，社交前总要完成安全检查。" },
  "autonomy|perception": { name: "边境守夜人", line: "边界清晰，认真记录周围每一处变化。" },
  "perception|stability": { name: "静夜哨兵", line: "感知敏锐，但内在节奏沉稳。" },
  "attachment|exploration": { name: "归巢冒险家", line: "既想探索世界，也喜欢确认你在附近。" },
  "exploration|social": { name: "星际领航员", line: "对新事物和新朋友都保持兴趣。" },
  "autonomy|exploration": { name: "荒野开拓者", line: "好奇心强，也坚持按自己的方法前进。" },
  "exploration|stability": { name: "恒星远征者", line: "敢于研究新事物，同时拥有稳定恢复力。" },
  "attachment|social": { name: "暖星联络员", line: "愿意回应善意，也重视共享陪伴。" },
  "attachment|autonomy": { name: "有边界的陪伴者", line: "深爱靠近，但要自己决定靠近方式。" },
  "attachment|stability": { name: "暖巢守护者", line: "关系稳定、陪伴持续，是温和的长期主义者。" },
  "autonomy|social": { name: "自由外交官", line: "愿意交朋友，但互动规则由自己制定。" },
  "social|stability": { name: "温和协调者", line: "面对关系开放，整体反应平稳可预测。" },
  "autonomy|stability": { name: "静默领航员", line: "不依赖持续关注，也清楚自己的节奏和边界。" },
};

const singleDimensionTypes: Record<DimensionId, { name: string; line: string }> = {
  perception: { name: "敏锐观测员", line: "它会认真读取环境变化，安全感来自可预测的空间线索。" },
  exploration: { name: "纸箱调查专家", line: "它对新鲜事物保持强烈兴趣，常用行动理解世界。" },
  attachment: { name: "暖巢贴近者", line: "它重视和主要照顾者的共享空间，会主动确认关系连接。" },
  social: { name: "友好接待员", line: "它更愿意回应温和的新关系，也容易从善意互动里获得安全感。" },
  autonomy: { name: "自由领地主", line: "它很重视选择权和身体边界，亲近也要按自己的节奏发生。" },
  stability: { name: "恒定生活家", line: "它的日常节律和恢复能力较稳定，反应通常比较容易预测。" },
};

const balancedType = {
  name: "均衡生活家",
  line: "它没有特别极端的单一倾向，更擅长根据环境和关系对象调整自己的行为方式。",
};

const lowModifiers: Record<DimensionId, string> = {
  perception: "松弛",
  exploration: "静栖",
  attachment: "远距离连接",
  social: "熟人专属",
  autonomy: "随和贴贴",
  stability: "流星节奏",
};

const strategyTags: Record<number, Record<string, { tag: string; monologue: string }>> = {
  61: {
    A: { tag: "随遇而安", monologue: "今天先放过零食柜，明天再议。" },
    B: { tag: "耐心守候", monologue: "我没有催你，我只是持续在场。" },
    C: { tag: "情感说服", monologue: "你看我的眼睛，再想想刚才的决定。" },
    D: { tag: "行动施压", monologue: "既然谈判暂停，我就启动桌面研究。" },
    E: { tag: "时机策略", monologue: "现在不行，那我换一个更合适的时间。" },
  },
  62: {
    A: { tag: "随遇而安", monologue: "门不开也没关系，世界还有别的地方。" },
    B: { tag: "门口守候员", monologue: "我没有催你，我只是在门口持续表达。" },
    C: { tag: "强烈表达", monologue: "这扇门需要听见我的意见。" },
    D: { tag: "门禁破解", monologue: "入口只是暂时没有被我找到。" },
    E: { tag: "人类调度官", monologue: "这位员工终于理解了我的手势。" },
  },
  63: {
    A: { tag: "自主陪伴", monologue: "你忙你的，我忙我的，我们都很专业。" },
    B: { tag: "静默陪伴", monologue: "我在旁边，不用宣布也算陪你。" },
    C: { tag: "正面索取", monologue: "请现在分配一点注意力给本猫。" },
    D: { tag: "键盘封锁战士", monologue: "既然屏幕重要，那我就成为屏幕。" },
    E: { tag: "规则施压", monologue: "有些规则需要通过实验重新谈判。" },
  },
  64: {
    A: { tag: "心虚逃逸", monologue: "我先撤退，故事由你来整理。" },
    B: { tag: "风险评估", monologue: "让我看看这件事的严重程度。" },
    C: { tag: "无辜伪装师", monologue: "证据在哪里？我只是路过。" },
    D: { tag: "注意转移", monologue: "只要我开始舔毛，剧情就会改变。" },
    E: { tag: "规则无视", monologue: "我听见了，但我有自己的版本。" },
  },
  65: {
    A: { tag: "独立留守", monologue: "请放心出门，我会管理家里。" },
    B: { tag: "行程观察", monologue: "包、钥匙、外套，我已记录。" },
    C: { tag: "跟随确认", monologue: "你要去哪里？我需要确认边界。" },
    D: { tag: "物理拦截", monologue: "包上已经有猫，出门计划自动延迟。" },
    E: { tag: "最后时刻挽留", monologue: "临走前，请补交一次互动费用。" },
  },
  66: {
    A: { tag: "偶然行为", monologue: "那只是一次路过，不必过度解读。" },
    B: { tag: "有限学习", monologue: "有时有用，有时不用，看心情。" },
    C: { tag: "目的沟通", monologue: "有效的方法值得在需要时复用。" },
    D: { tag: "行为仪式", monologue: "提醒流程已经标准化。" },
    E: { tag: "实验型策略家", monologue: "这次推杯子，下次研究抽屉。" },
  },
};

function scoreBand(score: number | null) {
  if (score === null) return "信息不足";
  if (score <= 32) return "偏低倾向";
  if (score <= 67) return "典型范围";
  return "偏高倾向";
}

function sortedPair(a: DimensionId, b: DimensionId) {
  return [a, b].sort().join("|");
}

function makeScientificType(kind: "balanced" | "single" | "pair", top: DimensionId, second: DimensionId) {
  if (kind === "balanced") return "均衡适应型";
  if (kind === "single") return `高${dimensions[top].label}主导型`;
  return `高${dimensions[top].label}·高${dimensions[second].label}型`;
}

function derivePersonality(
  scores: Record<DimensionId, number | null>,
  sortable: DimensionId[],
) {
  if (sortable.length < 2) {
    const top = sortable[0] ?? "attachment";
    const second = sortable[1] ?? "stability";
    const low = [...sortable].reverse()[0] ?? "social";
    return {
      top,
      second,
      low,
      type: { name: "猫格观察员", line: "这份画像更接近一次初步观察，补充更多有效答案后会更稳定。" },
      scientificType: "初步观察型",
      mainStars: [dimensions[top].star, dimensions[second].star, dimensions[low].star],
    };
  }

  const top = sortable[0] ?? "attachment";
  const second = sortable[1] ?? "stability";
  const low = [...sortable].reverse()[0] ?? "social";
  const validScores = sortable
    .map((id) => scores[id])
    .filter((score): score is number => score !== null);
  const topScore = scores[top] ?? 0;
  const secondScore = scores[second] ?? 0;
  const spread = validScores.length ? Math.max(...validScores) - Math.min(...validScores) : 0;

  if (validScores.length >= 6 && spread < 12) {
    return {
      top,
      second,
      low,
      type: balancedType,
      scientificType: makeScientificType("balanced", top, second),
      mainStars: [dimensions[top].star, dimensions[second].star, dimensions[low].star],
    };
  }

  if (topScore >= 85 && topScore - secondScore >= 15) {
    return {
      top,
      second,
      low,
      type: singleDimensionTypes[top],
      scientificType: makeScientificType("single", top, second),
      mainStars: [dimensions[top].star, dimensions[second].star, dimensions[low].star],
    };
  }

  return {
    top,
    second,
    low,
    type: typeMap[sortedPair(top, second)] ?? balancedType,
    scientificType: makeScientificType("pair", top, second),
    mainStars: [dimensions[top].star, dimensions[second].star, dimensions[low].star],
  };
}

function dimensionText(score: number | null, id: DimensionId) {
  if (score === null) return "这一维度有效答案不足，建议补充观察后再解读。";
  if (score <= 32) return dimensions[id].low;
  if (score <= 67) return dimensions[id].mid;
  return dimensions[id].high;
}

function dimensionNeed(id: DimensionId) {
  const needs: Record<DimensionId, string> = {
    perception: "它更需要可预测的动线、安静的退路，以及不会突然逼近的互动方式。",
    exploration: "它需要可控的新鲜感，例如纸箱、嗅闻、益智取食和能逐步解开的小游戏。",
    attachment: "它需要稳定回应和共享空间，但回应不等于随时抱起，安静陪伴也很重要。",
    social: "它需要低压力的关系建立方式，温和、慢速、可退出的新接触会比热情围观更有效。",
    autonomy: "它需要明确的身体边界和选择权，亲近最好由它主动发起或允许继续。",
    stability: "它需要规律作息和一致规则，惊吓、护理或变化后要给它恢复节奏的时间。",
  };
  return needs[id];
}

function directTrait(id: DimensionId, score: number | null, name: string) {
  if (score === null) return `${name}在${dimensions[id].label}上的有效答案还不够，暂时不适合下太明确的结论。`;

  const highTraits: Record<DimensionId, string> = {
    perception: `${name}是比较敏感、会读环境的猫。它很容易注意到声音、气味、陌生人和家里动线的变化，所以它的谨慎不是“胆小”，更像是在认真确认安全。`,
    exploration: `${name}的好奇心和行动力很强。它不只是“爱玩”，而是需要通过闻、看、钻、试、扑来理解这个家；如果日常刺激太少，它可能会把精力转移到夜跑、翻找、扒门或研究桌面物品上。`,
    attachment: `${name}是很需要关系确认的猫，也就是主人常说的“粘人”。它靠近你、跟着你、在你回家时重新建立接触，并不一定只是要吃的，而是在确认“你还在，我和你的关系还稳定”。`,
    social: `${name}对关系比较开放。它可能愿意接触熟悉家庭成员，也能在温和访客面前逐渐放松；但这仍然需要对方动作慢、声音低、不要一上来就摸。`,
    autonomy: `${name}的边界感很清楚。它不是不亲人，而是更在意“我能不能自己决定什么时候靠近、什么时候结束互动”。强抱、强摸、突然限制行动，容易让它把亲近和压力绑在一起。`,
    stability: `${name}的日常节奏相对稳定。它受刺激后更容易回到正常状态，也比较能承受等待和小挫折；这种稳定感会让主人觉得它“好懂、好预测”。`,
  };

  const lowTraits: Record<DimensionId, string> = {
    perception: `${name}整体更松弛大胆，对细小变化不一定特别在意。优点是适应起来可能没那么紧绷，但也要注意它有时不会很早表达压力信号。`,
    exploration: `${name}更偏熟悉派，不一定会主动研究所有新东西。它可能不是不聪明，而是更挑玩具、更依赖熟悉环境和正确的互动方式。`,
    attachment: `${name}的亲近方式更独立。它不一定频繁贴着人，但这不等于不喜欢主人；它可能更习惯用同房、远距离观察或固定时间靠近来维持关系。`,
    social: `${name}更像熟人专属型。它对陌生人慢热，甚至会先躲开观察；这不是“脾气差”，而是它需要更长时间确认对方安全。`,
    autonomy: `${name}对触摸和安排相对随和，可能更容易接受熟悉的人抱起、摸摸或调整位置。即便如此，也要保留退出空间，避免把随和用过头。`,
    stability: `${name}的状态切换可能比较快，需求受阻时更容易升级表达。它不是故意“闹”，更可能是还没学会用低强度方式等待或恢复。`,
  };

  if (score >= 68) return highTraits[id];
  if (score <= 32) return lowTraits[id];
  return `${name}在${dimensions[id].label}上处于典型范围：它不是固定一种模式，而是会根据当时环境、对象和身体状态切换反应。`;
}

function attachmentPressureNote(
  name: string,
  scores: Record<DimensionId, number | null>,
  relationshipAnswers: Record<number, string>,
) {
  const attachment = scores.attachment ?? 0;
  const stability = scores.stability ?? 50;
  const follows = relationshipAnswers[53] === "A";
  const greetsStrongly = relationshipAnswers[52] === "A";
  const blocksLeaving = relationshipAnswers[65] === "C" || relationshipAnswers[65] === "E";

  if (attachment >= 78 && (stability <= 45 || follows || greetsStrongly || blocksLeaving)) {
    return `${name}可能不只是“喜欢粘着你”，还可能更容易在你离开、关门、长时间不回应时出现独处压力。这里不能直接诊断为分离焦虑，但如果你观察到出门前明显紧张、你离开后持续叫、抓门、破坏、食欲下降或如厕异常，就建议把它当成需要认真处理的压力信号。`;
  }

  if (attachment >= 68) {
    return `${name}的依附需求比较高。它会更在意你是否回应、是否在同一个空间、离开后是否会回来。你可以把这种“粘人”理解成关系确认需求，而不是单纯撒娇。`;
  }

  if (attachment <= 32) {
    return `${name}不一定用贴身方式表达亲近。对它来说，保持距离、在同一空间休息、固定时间出现，也可能已经是在参与关系。`;
  }

  return `${name}对陪伴的需求比较弹性：有时想靠近，有时也能自己待着。主人可以观察它主动靠近的时间点，而不是用是否一直贴身来判断亲不亲。`;
}

function strategyInsight(name: string, strategyAnswers: Record<number, string>) {
  if (strategyAnswers[63] === "D") {
    return `${name}已经学会用“打断你”来换取注意力，例如挡屏幕、踩键盘或直接占据你的工作区域。与其事后生气，不如提前安排固定互动时间，让它不用把打断升级成沟通方式。`;
  }
  if (strategyAnswers[62] === "E") {
    return `${name}很会调度人类。它可能会把你带到门边、柜子前或某个目标地点，用行动告诉你“现在该你处理了”。这说明它能把自己的需求和你的反应联系起来。`;
  }
  if (strategyAnswers[61] === "E") {
    return `${name}有一定时机策略。被拒绝后不一定立刻放弃，而是可能换个时间、换个方式重新提出需求。`;
  }
  if (strategyAnswers[66] === "D" || strategyAnswers[66] === "E") {
    return `${name}很会学习主人反应。只要某个动作成功引起过注意，它就可能把这个动作变成固定提醒，甚至继续测试新方法。`;
  }
  return `${name}的行为策略目前看起来不算激烈，更像是在用已有经验和主人沟通。后续可以继续观察哪些行为会被它反复使用。`;
}

function generatePracticalAdvice(
  scores: Record<DimensionId, number | null>,
  top: DimensionId,
  second: DimensionId,
  relationshipAnswers: Record<number, string>,
  strategyAnswers: Record<number, string>,
) {
  const advice = new Set<string>();

  if ((scores.attachment ?? 0) >= 68) {
    advice.add("每天安排2-3次短而稳定的高质量陪伴，每次5-10分钟也可以，重点是固定、可预期，而不是偶尔一次玩很久。");
    advice.add("出门和回家时保持平静流程，不要把离开演成很大的告别；回家后先温和回应，再进入正常互动。");
  }
  if ((scores.exploration ?? 0) >= 68) {
    advice.add("用逗猫棒模拟完整捕猎流程：发现、追逐、扑咬、抓住、吃一点小零食或主食，让它的精力有出口。");
    advice.add("每周轮换纸箱、嗅闻垫、藏食玩具或高处路线，给它新鲜感，但一次不要把环境改得太猛。");
  }
  if ((scores.perception ?? 0) >= 68) {
    advice.add("访客来时先给它退路和观察位，不要让陌生人追着摸；让它自己决定什么时候靠近。");
  }
  if ((scores.autonomy ?? 0) >= 68) {
    advice.add("把抚摸控制在它愿意的时长内，看到尾巴快速摆动、耳朵后压、转头或身体后移，就及时停手。");
  }
  if ((scores.stability ?? 0) <= 45) {
    advice.add("需求被拒绝时不要等它叫到很激烈才回应，可以训练一个低强度替代行为，比如坐下、看向你、到固定垫子上等待。");
  }
  if (relationshipAnswers[57] === "E" || strategyAnswers[63] === "D") {
    advice.add("如果它爱挡屏幕或踩键盘，可以在桌边放一个专属垫子，并在它躺到垫子上时立刻奖励，让它有“陪你工作”的合法位置。");
  }

  advice.add(dimensionNeed(top));
  advice.add(dimensionNeed(second));

  return Array.from(advice).slice(0, 6);
}

function comboInsight(top: DimensionId, second: DimensionId, name: string) {
  const pair = sortedPair(top, second);
  const insights: Record<string, string> = {
    "exploration|perception": `${name}很可能是一边谨慎扫描、一边忍不住靠近检查的类型。它不是单纯胆小，也不是完全莽撞，而是会先收集气味、声音和退路信息，再决定要不要继续探索。`,
    "attachment|perception": `${name}会把信任集中放在熟悉的人和稳定环境里。它可能对外界变化比较敏感，但在确认你和家里环境可靠之后，会用靠近、观察或共享空间来建立安全感。`,
    "autonomy|attachment": `${name}的亲近方式带有很强的选择权：它可能愿意陪你、靠近你，但不喜欢被强行安排亲密。对它来说，“我自己来贴贴”比“被抱过来”更舒服。`,
    "autonomy|exploration": `${name}既想按自己的方式研究世界，也会坚持自己的边界。它适合拥有可选择的路线、高处、藏身点和能够自主决定开始结束的游戏。`,
    "exploration|stability": `${name}的探索欲和恢复力可以形成很好的组合：它愿意尝试新东西，也比较容易在兴奋之后回到日常节奏。`,
    "social|stability": `${name}在关系上相对开放，同时反应节奏比较稳定。只要互动方式温和，它往往能逐渐建立可预测的社交模式。`,
  };
  return insights[pair] ?? `${name}的猫格不是单一标签能概括的。${dimensions[top].label}决定了它最容易表现出来的行为方向，${dimensions[second].label}则影响它在不同情境中如何调整节奏。`;
}

function generateCoreAnalysis({
  name,
  scores,
  top,
  second,
  low,
  scientificType,
  relationshipAnswers,
  strategyAnswers,
}: {
  name: string;
  scores: Record<DimensionId, number | null>;
  top: DimensionId;
  second: DimensionId;
  low: DimensionId;
  scientificType: string;
  relationshipAnswers: Record<number, string>;
  strategyAnswers: Record<number, string>;
}) {
  const topScore = scores[top];
  const secondScore = scores[second];
  const lowScore = scores[low];
  return [
    {
      title: "它到底是什么样的猫",
      body: `${name}的科学类型是${scientificType}。更直白地说，${dimensions[top].label}${topScore === null ? "" : `（${topScore}）`}和${dimensions[second].label}${secondScore === null ? "" : `（${secondScore}）`}是这份报告里最重要的两个线索。${directTrait(top, topScore, name)}`,
    },
    {
      title: "你可能最常在这些场景里感受到它",
      body: comboInsight(top, second, name),
    },
    {
      title: "它对你的关系需求",
      body: attachmentPressureNote(name, scores, relationshipAnswers),
    },
    {
      title: "容易被误解的地方",
      body: `相对较低或较不突出的维度是${dimensions[low].label}${lowScore === null ? "" : `（${lowScore}）`}。这不表示${name}缺少这项能力，而是说明它可能更少在日常里稳定表现出这一端特征。${dimensionText(lowScore, low)}`,
    },
    {
      title: "它正在训练你什么",
      body: strategyInsight(name, strategyAnswers),
    },
  ];
}

function makeId() {
  return `CAT-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function snapToEditorGrid(value: number, size: number) {
  const gridSize = 16;
  const step = (gridSize / size) * 100;
  if (!Number.isFinite(step) || step <= 0) return value;
  return clamp(Math.round(value / step) * step, 4, 96);
}

function getPosterAccessoryCanvasSize(id: AccessoryId) {
  return Math.round(getAccessoryCanvasSize(id) * 0.42);
}

const personalityStampMap: Record<DimensionId, { title: string; icon: AccessoryId }> = {
  perception: { title: "雷达常开", icon: "tinyButterfly" },
  exploration: { title: "先去看看", icon: "tinyBird" },
  attachment: { title: "贴身巡航", icon: "luckyClover" },
  social: { title: "欢迎营业", icon: "flowerCrown" },
  autonomy: { title: "边界清楚", icon: "woodFence" },
  stability: { title: "节奏稳定", icon: "roundStone" },
};

function topScoredDimensions(scores: Record<DimensionId, number | null>, count = 3) {
  return [...dimensionOrder]
    .sort((left, right) => (scores[right] ?? -1) - (scores[left] ?? -1))
    .slice(0, count);
}

function makeAccessoryInstance(accessoryId: AccessoryId): AccessoryInstance {
  const item = accessoryCatalog.find((entry) => entry.id === accessoryId) ?? accessoryCatalog[0];
  const drift = Math.random() * 8 - 4;
  return {
    uid: `${accessoryId}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
    accessoryId,
    x: clamp(item.defaultPlacement.x + drift, 4, 96),
    y: clamp(item.defaultPlacement.y + drift, 4, 96),
    scale: item.defaultPlacement.scale,
    colors: { ...item.defaultColors },
  };
}

function RadarChart({ scores }: { scores: Record<DimensionId, number | null> }) {
  const ids = dimensionOrder;
  const size = 300;
  const center = size / 2;
  const radius = 104;
  const points = ids.map((id, index) => {
    const angle = (Math.PI * 2 * index) / ids.length - Math.PI / 2;
    const value = scores[id] ?? 45;
    const r = radius * (value / 100);
    return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
  });

  return (
    <svg className="radar" viewBox={`0 0 ${size} ${size}`} aria-label="六维性格雷达图" role="img">
      {[0.2, 0.4, 0.6, 0.8, 1].map((level) => {
        const ring = ids.map((_, index) => {
          const angle = (Math.PI * 2 * index) / ids.length - Math.PI / 2;
          const r = radius * level;
          return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
        });
        return <polygon key={level} points={ring.join(" ")} className="radar-ring" />;
      })}
      {ids.map((id, index) => {
        const angle = (Math.PI * 2 * index) / ids.length - Math.PI / 2;
        return (
          <g key={id}>
            <line x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} />
            <text x={center + Math.cos(angle) * 132} y={center + Math.sin(angle) * 132} textAnchor="middle" dominantBaseline="middle">
              {dimensions[id].label}
            </text>
          </g>
        );
      })}
      <polygon points={points.join(" ")} className="radar-fill" />
      <polyline points={`${points.join(" ")} ${points[0]}`} className="radar-line" />
    </svg>
  );
}

export default function Home() {
  const [authorized, setAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [authorizedCode, setAuthorizedCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [screen, setScreen] = useState<Screen>("profile");
  const [resultView, setResultView] = useState<ResultView>("image");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: "",
    gender: "",
    arrival: "",
    family: "单猫家庭",
  });
  const [photo, setPhoto] = useState<string>("");
  const [generatedCatImage, setGeneratedCatImage] = useState<string>("");
  const [compositedAvatarImage, setCompositedAvatarImage] = useState<string>("");
  const [imageGenerationStatus, setImageGenerationStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [imageGenerationProvider, setImageGenerationProvider] = useState<ImageGenerationProvider>("none");
  const [imageGenerationNote, setImageGenerationNote] = useState("");
  const [imageGenerationAuthCode, setImageGenerationAuthCode] = useState("");
  const [coreAnswers, setCoreAnswers] = useState<Record<number, number | "unknown">>({});
  const [relationshipAnswers, setRelationshipAnswers] = useState<Record<number, string>>({});
  const [strategyAnswers, setStrategyAnswers] = useState<Record<number, string>>({});
  const [safetyFlags, setSafetyFlags] = useState<Record<number, boolean>>({});
  const [reportId, setReportId] = useState(makeId);
  const [accessories, setAccessories] = useState<AccessoryInstance[]>([]);
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<AccessoryId>("starCrown");
  const [activeAccessoryUid, setActiveAccessoryUid] = useState<string | null>(null);
  const [catLayer, setCatLayer] = useState<CatLayer>(defaultCatLayer);
  const [activeCanvasItem, setActiveCanvasItem] = useState<ActiveCanvasItem>(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const draggingAccessoryUidRef = useRef<string | null>(null);
  const draggingCatRef = useRef(false);
  const resizeGestureRef = useRef<ResizeGesture | null>(null);
  const dragOffsetRef = useRef<DragOffset>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const editorPhotoRef = useRef<HTMLDivElement>(null);

  const catName = profile.name.trim() || "它";
  const currentItem = testItems[questionIndex];
  const progress = screen === "profile"
    ? 0
    : screen === "test"
      ? ((questionIndex + 1) / testItems.length) * 100
      : 100;
  const activeAccessory = accessories.find((item) => item.uid === activeAccessoryUid) ?? null;
  const activeAccessoryMeta = accessoryCatalog.find((item) => item.id === (activeAccessory?.accessoryId ?? selectedAccessoryId)) ?? accessoryCatalog[0];
  const activeAccessoryColors = activeAccessory?.colors ?? activeAccessoryMeta.defaultColors;
  const isCatSelected = activeCanvasItem?.kind === "cat";
  const isDemoPreview = authorizedCode === "DEMO-PREVIEW";
  const effectiveImageAuthCode = isDemoPreview ? imageGenerationAuthCode.trim().toUpperCase() : authorizedCode || accessCode.trim().toUpperCase();
  const imageGenerationSourceLabel = imageGenerationProvider === "ark-seedream"
    ? "真实 AI 生图"
    : imageGenerationProvider === "stored"
      ? "已保存的历史图"
      : imageGenerationProvider === "local-preview"
        ? "本地预览图"
        : imageGenerationStatus === "loading"
          ? "正在调用后端"
          : "尚未生成";
  const imageGenerationBadgeLabel = imageGenerationProvider === "ark-seedream" || imageGenerationProvider === "stored"
    ? "已成功"
    : imageGenerationProvider === "local-preview"
      ? "预览模式"
      : imageGenerationStatus === "error"
        ? "未成功"
        : imageGenerationStatus === "loading"
          ? "生成中"
          : "待生成";
  const imageGenerationTone = imageGenerationProvider === "ark-seedream" || imageGenerationProvider === "stored"
    ? "ai"
    : imageGenerationProvider === "local-preview"
      ? "preview"
      : imageGenerationStatus;

  const result = useMemo(() => {
    const scores = {} as Record<DimensionId, number | null>;
    const counts = {} as Record<DimensionId, number>;
    (Object.keys(dimensions) as DimensionId[]).forEach((id) => {
      const items = coreQuestions.filter((q) => q.dimension === id);
      const valid = items
        .map((q) => {
          const raw = coreAnswers[q.id];
          if (raw === undefined || raw === "unknown") return null;
          return q.reverse ? 6 - raw : raw;
        })
        .filter((value): value is number => value !== null);
      counts[id] = valid.length;
      if (valid.length < 6) {
        scores[id] = null;
      } else {
        const average = valid.reduce((sum, value) => sum + value, 0) / valid.length;
        scores[id] = Math.round(((average - 1) / 4) * 100);
      }
    });

    return {
      scores,
      counts,
      report: buildAppCatReport({
        profile,
        reportId,
        coreAnswers,
        relationshipAnswers,
        strategyAnswers,
        safetyFlags,
        scores,
      }),
    };
  }, [coreAnswers, profile, relationshipAnswers, reportId, safetyFlags, strategyAnswers]);

  function authorize() {
    const normalizedCode = accessCode.trim().toUpperCase();
    const recognizedCodes = ACCESS_CODES.map((code) => code.toUpperCase());
    if (recognizedCodes.includes(normalizedCode)) {
      setAuthorized(true);
      setAuthorizedCode(normalizedCode);
      setAccessError("");
    } else {
      setAccessError("授权码暂未识别。可试用：CATLAB2026");
    }
  }

  function openDemoReport() {
    setAuthorized(true);
    setAuthorizedCode("DEMO-PREVIEW");
    setProfile({
      name: "薄荷",
      age: "1岁3个月",
      gender: "女孩",
      arrival: "2025年春天",
      family: "单猫家庭",
    });
    setCoreAnswers(demoCoreAnswers);
    setRelationshipAnswers(demoRelationshipAnswers);
    setStrategyAnswers(demoStrategyAnswers);
    setSafetyFlags({});
    setReportId("CAT-STAR-0001");
    setPhoto("");
    setCompositedAvatarImage("");
    setGeneratedCatImage(createPixelCatSvgDataUrl({
      name: "薄荷",
      title: "先观察再出手的好奇侦探",
      scores: demoScores,
    }));
    setImageGenerationStatus("ready");
    setImageGenerationProvider("local-preview");
    setImageGenerationNote("已加载演示像素猫底图，可以直接拖动饰品看效果。");
    setImageGenerationAuthCode("");
    setAccessories([]);
    setSelectedAccessoryId("starCrown");
    setActiveAccessoryUid(null);
    setActiveCanvasItem(null);
    setCatLayer(defaultCatLayer);
    setQuestionIndex(testItems.length - 1);
    setScreen("result");
  }

  function updateProfile(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
      setGeneratedCatImage("");
      setCompositedAvatarImage("");
      setImageGenerationStatus("idle");
      setImageGenerationProvider("none");
      setImageGenerationNote("");
    };
    reader.readAsDataURL(file);
  }

  async function generatePixelCatImage() {
    if (!report) return;
    if (!effectiveImageAuthCode) {
      setImageGenerationStatus("error");
      setImageGenerationProvider("none");
      setImageGenerationNote(isDemoPreview ? "演示报告需要先填写一个真实授权码，才能调用 AI 生图。" : "缺少授权码，无法生成图片。");
      return;
    }
    setImageGenerationStatus("loading");
    setImageGenerationProvider("none");
    setImageGenerationNote("正在生成像素猫底图...");

    try {
      const response = await fetch("/api/generate-cat-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catName,
          authCode: effectiveImageAuthCode,
          scientificType: report.personality.scientificType,
          mainTitle: report.personality.mainTitle,
          coreJudgment: report.personality.coreJudgment,
          scores: result.scores,
          photoDataUrl: photo || undefined,
        }),
      });

      if (!response.ok) throw new Error(`Image API returned ${response.status}`);
      const data = (await response.json()) as { imageUrl?: string; provider?: ImageGenerationProvider; note?: string; transparentBackground?: boolean };
      if (!data.imageUrl) throw new Error("Image API did not return imageUrl");

      setGeneratedCatImage(data.imageUrl);
      setCompositedAvatarImage("");
      setImageGenerationStatus("ready");
      setImageGenerationProvider(data.provider ?? "none");
      setImageGenerationNote(data.note || (data.transparentBackground ? "已生成透明背景像素猫。" : data.provider === "ark-seedream" ? "已生成 AI 像素猫底图。本授权码已使用一次生图额度。" : "已生成像素猫预览图。"));
    } catch {
      setGeneratedCatImage(createPixelCatSvgDataUrl({
        name: catName,
        title: report.personality.mainTitle,
        scores: result.scores,
      }));
      setCompositedAvatarImage("");
      setImageGenerationStatus("error");
      setImageGenerationProvider("none");
      setImageGenerationNote(window.location.hostname === "localhost"
        ? "当前是本地前端预览，未调用 AI 生图。请打开 Netlify 线上地址，或用 netlify dev 启动后端函数。"
        : "AI 生图暂未成功，已显示本地预览图。请检查 Netlify 环境变量和函数日志。");
    }
  }

  async function downloadCard() {
    if (!cardRef.current) return;
    const image = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#10172a",
      filter: (node) => !(node instanceof HTMLElement && node.dataset.exportHidden === "true"),
    });
    const link = document.createElement("a");
    link.download = `${catName}-猫格观测卡.png`;
    link.href = image;
    link.click();
  }

  async function waitForImages(container: HTMLElement) {
    const images = Array.from(container.querySelectorAll("img"));
    await Promise.all(images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return;
      if (typeof image.decode === "function") {
        await image.decode().catch(() => undefined);
        return;
      }
      await new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      });
    }));
  }

  async function finishImageEditor() {
    if (editorPhotoRef.current) {
      try {
        setImageGenerationNote("正在保存头像...");
        await waitForImages(editorPhotoRef.current);
        editorPhotoRef.current.classList.add("capture-clean");
        const image = await toPng(editorPhotoRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          filter: (node) => !(node instanceof HTMLElement && node.dataset.editorControl === "true"),
        });
        setCompositedAvatarImage(image);
        setImageGenerationStatus("ready");
        setImageGenerationNote("头像已保存到总览卡。");
      } catch (error) {
        console.error("Avatar save failed", error);
        setImageGenerationStatus("error");
        setImageGenerationNote(`头像保存失败：${error instanceof Error ? error.message : "请稍等图片加载完成后再试一次。"}`);
        return;
      } finally {
        editorPhotoRef.current.classList.remove("capture-clean");
      }
    }
    setIsImageEditorOpen(false);
  }

  function openImageEditor() {
    if (!report) return;
    if (!posterImage) {
      setGeneratedCatImage(createPixelCatSvgDataUrl({
        name: catName,
        title: report.personality.mainTitle,
        scores: result.scores,
      }));
      setImageGenerationStatus("ready");
      setImageGenerationNote("已生成本地像素猫预览图，可以在编辑器里继续装饰。");
    }
    setIsImageEditorOpen(true);
  }

  function moveAccessory(event: PointerEvent<HTMLElement>, uid: string, stage: HTMLDivElement | null, offset: DragOffset = { x: 0, y: 0 }) {
    const rect = stage?.getBoundingClientRect();
    if (!rect) return;
    const x = snapToEditorGrid(clamp(((event.clientX - rect.left) / rect.width) * 100 - offset.x, 4, 96), rect.width);
    const y = snapToEditorGrid(clamp(((event.clientY - rect.top) / rect.height) * 100 - offset.y, 4, 96), rect.height);
    setAccessories((current) => current.map((item) => (item.uid === uid ? { ...item, x, y } : item)));
  }

  function moveCat(event: PointerEvent<HTMLElement>, stage: HTMLDivElement | null, offset: DragOffset = { x: 0, y: 0 }) {
    const rect = stage?.getBoundingClientRect();
    if (!rect) return;
    const x = snapToEditorGrid(clamp(((event.clientX - rect.left) / rect.width) * 100 - offset.x, 4, 96), rect.width);
    const y = snapToEditorGrid(clamp(((event.clientY - rect.top) / rect.height) * 100 - offset.y, 4, 96), rect.height);
    setCatLayer((current) => ({ ...current, x, y }));
  }

  function makeDragOffset(event: PointerEvent<HTMLElement>, stage: HTMLDivElement | null, x: number, y: number): DragOffset {
    const rect = stage?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100 - x,
      y: ((event.clientY - rect.top) / rect.height) * 100 - y,
    };
  }

  function beginCatDrag(event: PointerEvent<HTMLElement>, stage: HTMLDivElement | null) {
    event.preventDefault();
    event.stopPropagation();
    setActiveAccessoryUid(null);
    setActiveCanvasItem({ kind: "cat" });
    draggingCatRef.current = true;
    dragOffsetRef.current = makeDragOffset(event, stage, catLayer.x, catLayer.y);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function dragCat(event: PointerEvent<HTMLElement>, stage: HTMLDivElement | null) {
    if (!draggingCatRef.current) return;
    moveCat(event, stage, dragOffsetRef.current);
  }

  function endCatDrag(event: PointerEvent<HTMLElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingCatRef.current = false;
    dragOffsetRef.current = { x: 0, y: 0 };
  }

  function beginAccessoryDrag(event: PointerEvent<HTMLElement>, uid: string, stage: HTMLDivElement | null) {
    event.preventDefault();
    event.stopPropagation();
    const instance = accessories.find((item) => item.uid === uid);
    if (instance) setSelectedAccessoryId(instance.accessoryId);
    setActiveAccessoryUid(uid);
    setActiveCanvasItem({ kind: "accessory", uid });
    draggingAccessoryUidRef.current = uid;
    if (instance) dragOffsetRef.current = makeDragOffset(event, stage, instance.x, instance.y);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function dragAccessory(event: PointerEvent<HTMLElement>, uid: string, stage: HTMLDivElement | null) {
    if (draggingAccessoryUidRef.current !== uid) return;
    moveAccessory(event, uid, stage, dragOffsetRef.current);
  }

  function endAccessoryDrag(event: PointerEvent<HTMLElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    draggingAccessoryUidRef.current = null;
    dragOffsetRef.current = { x: 0, y: 0 };
  }

  function addAccessory(id: AccessoryId) {
    const next = makeAccessoryInstance(id);
    setSelectedAccessoryId(id);
    setActiveAccessoryUid(next.uid);
    setActiveCanvasItem({ kind: "accessory", uid: next.uid });
    setAccessories((current) => [...current, next]);
  }

  function resizeActiveAccessory(delta: number) {
    if (!activeAccessoryUid) return;
    setAccessories((current) => current.map((item) => (
      item.uid === activeAccessoryUid
        ? { ...item, scale: clamp(item.scale + delta, 0.45, 1.6) }
        : item
    )));
  }

  function updateActiveAccessoryColor(slot: AccessoryColorSlot, color: string) {
    if (!activeAccessoryUid) return;
    setAccessories((current) => current.map((item) => (
      item.uid === activeAccessoryUid
        ? { ...item, colors: { ...item.colors, [slot]: color } }
        : item
    )));
  }

  function applyAccessoryPalette(colors: AccessoryColors) {
    if (!activeAccessoryUid) return;
    setAccessories((current) => current.map((item) => (
      item.uid === activeAccessoryUid ? { ...item, colors: { ...colors } } : item
    )));
  }

  function resetAccessories() {
    setAccessories([]);
    setSelectedAccessoryId("starCrown");
    setActiveAccessoryUid(null);
    setActiveCanvasItem(null);
    setCatLayer(defaultCatLayer);
  }

  function removeActiveAccessory() {
    if (!activeAccessoryUid) return;
    setAccessories((current) => current.filter((item) => item.uid !== activeAccessoryUid));
    setActiveAccessoryUid(null);
    setActiveCanvasItem(null);
  }

  function removeCanvasItem(kind: "cat" | "accessory", uid?: string) {
    if (kind === "cat") {
      setGeneratedCatImage("");
      setImageGenerationStatus("idle");
      setImageGenerationProvider("none");
      setImageGenerationNote("");
      setActiveCanvasItem(null);
      return;
    }
    if (!uid) return;
    setAccessories((current) => current.filter((item) => item.uid !== uid));
    if (activeAccessoryUid === uid) {
      setActiveAccessoryUid(null);
      setActiveCanvasItem(null);
    }
  }

  function placeActiveAccessory(event: PointerEvent<HTMLElement>, stage: HTMLDivElement | null) {
    if (event.target !== event.currentTarget) return;
    if (!activeAccessoryUid) return;
    moveAccessory(event, activeAccessoryUid, stage);
  }

  function resizeCat(delta: number) {
    setCatLayer((current) => ({ ...current, scale: clamp(current.scale + delta, 0.45, 1.35) }));
  }

  function beginCanvasItemResize(
    event: PointerEvent<HTMLElement>,
    kind: "cat" | "accessory",
    stage: HTMLDivElement | null,
    uid?: string,
  ) {
    const rect = stage?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    event.stopPropagation();

    const item = kind === "cat" ? catLayer : accessories.find((entry) => entry.uid === uid);
    if (!item) return;
    if (kind === "accessory" && uid) {
      const instance = accessories.find((entry) => entry.uid === uid);
      if (instance) setSelectedAccessoryId(instance.accessoryId);
      setActiveAccessoryUid(uid);
      setActiveCanvasItem({ kind: "accessory", uid });
    } else {
      setActiveAccessoryUid(null);
      setActiveCanvasItem({ kind: "cat" });
    }

    resizeGestureRef.current = {
      kind,
      uid,
      startDistance: canvasDistanceFromItemCenter(event, rect, item.x, item.y),
      startScale: item.scale,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function resizeCanvasItem(event: PointerEvent<HTMLElement>, stage: HTMLDivElement | null) {
    const gesture = resizeGestureRef.current;
    const rect = stage?.getBoundingClientRect();
    if (!gesture || !rect) return;
    event.preventDefault();
    event.stopPropagation();

    const item = gesture.kind === "cat" ? catLayer : accessories.find((entry) => entry.uid === gesture.uid);
    if (!item || gesture.startDistance <= 0) return;
    const nextScale = gesture.startScale * (canvasDistanceFromItemCenter(event, rect, item.x, item.y) / gesture.startDistance);
    if (gesture.kind === "cat") {
      setCatLayer((current) => ({ ...current, scale: clamp(nextScale, 0.45, 1.35) }));
      return;
    }
    setAccessories((current) => current.map((entry) => (
      entry.uid === gesture.uid ? { ...entry, scale: clamp(nextScale, 0.45, 1.6) } : entry
    )));
  }

  function endCanvasItemResize(event: PointerEvent<HTMLElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resizeGestureRef.current = null;
  }

  function canvasDistanceFromItemCenter(event: PointerEvent<HTMLElement>, rect: DOMRect, x: number, y: number) {
    const centerX = rect.left + (x / 100) * rect.width;
    const centerY = rect.top + (y / 100) * rect.height;
    return Math.max(8, Math.hypot(event.clientX - centerX, event.clientY - centerY));
  }

  function advanceAfterAnswer() {
    if (questionIndex < testItems.length - 1) {
      setQuestionIndex((value) => Math.min(value + 1, testItems.length - 1));
      return;
    }
    setScreen("generating");
  }

  function answerCore(id: number, value: number | "unknown") {
    setCoreAnswers((current) => ({ ...current, [id]: value }));
    advanceAfterAnswer();
  }

  function answerRelationship(id: number, value: string) {
    setRelationshipAnswers((current) => ({ ...current, [id]: value }));
    advanceAfterAnswer();
  }

  function answerStrategy(id: number, value: string) {
    setStrategyAnswers((current) => ({ ...current, [id]: value }));
    advanceAfterAnswer();
  }

  function answerSafety(id: number, value: boolean) {
    setSafetyFlags((current) => ({ ...current, [id]: value }));
    advanceAfterAnswer();
  }

  function resetTest() {
    setScreen("profile");
    setQuestionIndex(0);
    setCoreAnswers({});
    setRelationshipAnswers({});
    setStrategyAnswers({});
    setSafetyFlags({});
    setReportId(makeId());
  }

  function goBack() {
    if (screen === "profile") return;
    if (screen === "result") {
      setScreen("test");
      setQuestionIndex(testItems.length - 1);
      return;
    }
    if (questionIndex === 0) {
      setScreen("profile");
      return;
    }
    setQuestionIndex((value) => value - 1);
  }

  function goNext() {
    if (screen === "profile") {
      setScreen("test");
      setQuestionIndex(0);
      return;
    }
    if (screen !== "test") return;
    if (questionIndex < testItems.length - 1) {
      setQuestionIndex((value) => value + 1);
      return;
    }
    setResultView("image");
    setScreen("generating");
  }

  useEffect(() => {
    if (screen !== "generating") return;
    const timeout = window.setTimeout(() => setScreen("result"), 1800);
    return () => window.clearTimeout(timeout);
  }, [screen]);

  const report = result.report;
  const reportParagraphs = report?.scientificSummary.split(/\n\n+/).filter(Boolean) ?? [];
  const posterScore = report
    ? Math.round(Object.values(report.scores).reduce((sum, score) => sum + score, 0) / Object.values(report.scores).length)
    : 0;
  const confidencePercent = report ? Math.round(report.confidence.completeness * 100) : 0;
  const posterImage = generatedCatImage || photo;
  const topPosterDimensions = report ? topScoredDimensions(result.scores, 3) : [];

  if (!authorized) {
    return (
      <main className="gate-page">
        <section className="gate-panel">
          <div className="brand-mark">
            <Moon size={22} />
            <span>猫格观测所</span>
          </div>
          <div className="gate-copy">
            <p className="eyebrow">Cat Behavior Observatory</p>
            <h1>输入授权码，开启猫咪的性格观测</h1>
            <p>
              完成一组基于日常观察的题目，上传猫咪照片，生成六维猫格报告与可保存的观测卡。
            </p>
          </div>
          <label className="code-field">
            <LockKeyhole size={18} />
            <input
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && authorize()}
              placeholder="请输入授权码"
              aria-label="授权码"
            />
          </label>
          {accessError && <p className="form-note error">{accessError}</p>}
          <button className="primary-button" onClick={authorize}>
            <ShieldCheck size={18} />
            进入测试
          </button>
          <button className="secondary-button full preview-button" onClick={openDemoReport}>
            <Sparkles size={17} />
            直接预览最终报告
          </button>
          <p className="quiet-note">当前版本为静态演示站，所有照片与答案仅在本机浏览器中处理。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="work-area">
        <header className="top-bar">
          <div>
            <p className="eyebrow">猫格观测所</p>
            <h1>{screenTitle(screen, catName, questionIndex)}</h1>
          </div>
          <div className="meter" aria-label="完成进度">
            <span style={{ width: `${progress}%` }} />
          </div>
        </header>

        {screen === "profile" && (
          <section className="panel profile-grid">
            <div className="photo-uploader">
              <div className="photo-preview">
                {photo ? <img src={photo} alt={`${catName}的照片`} /> : <Camera size={56} />}
              </div>
              <label className="secondary-button">
                <Upload size={17} />
                上传猫咪照片
                <input type="file" accept="image/*" onChange={handlePhoto} />
              </label>
            </div>
            <div className="profile-fields">
              <label>
                猫咪昵称
                <input value={profile.name} onChange={(event) => updateProfile("name", event.target.value)} placeholder="例如：芝麻" />
              </label>
              <label>
                年龄
                <input value={profile.age} onChange={(event) => updateProfile("age", event.target.value)} placeholder="例如：2岁半" />
              </label>
              <label>
                性别 / 状态
                <input value={profile.gender} onChange={(event) => updateProfile("gender", event.target.value)} placeholder="例如：妹妹，已绝育" />
              </label>
              <label>
                到家时间
                <input value={profile.arrival} onChange={(event) => updateProfile("arrival", event.target.value)} placeholder="例如：2023年春天" />
              </label>
              <label>
                家庭环境
                <select value={profile.family} onChange={(event) => updateProfile("family", event.target.value)}>
                  <option>单猫家庭</option>
                  <option>多猫家庭</option>
                  <option>猫狗同住</option>
                  <option>临时寄养或刚到家</option>
                </select>
              </label>
              <div className="info-strip">
                <FileText size={18} />
                请按最近30天、熟悉家庭环境中的通常表现作答。刚搬家、生病或术后建议恢复稳定后再测。
              </div>
              <button className="secondary-button full preview-button" onClick={openDemoReport}>
                <Sparkles size={17} />
                直接预览最终报告
              </button>
            </div>
          </section>
        )}

        {screen === "test" && currentItem && (
          <SingleQuestion
            item={currentItem}
            index={questionIndex}
            total={testItems.length}
            coreAnswers={coreAnswers}
            relationshipAnswers={relationshipAnswers}
            strategyAnswers={strategyAnswers}
            safetyFlags={safetyFlags}
            onCoreAnswer={answerCore}
            onRelationshipAnswer={answerRelationship}
            onStrategyAnswer={answerStrategy}
            onSafetyAnswer={answerSafety}
          />
        )}

        {screen === "generating" && (
          <section className="panel generating-panel" aria-live="polite">
            <div className="generating-orbit">
              <Sparkles size={34} />
            </div>
            <p className="eyebrow">Generating Report</p>
            <h2>正在生成报告</h2>
            <p>正在整理{catName}的行为答案、关系线索和猫格称号，请稍等一下。</p>
            <div className="loading-line"><span /></div>
          </section>
        )}

        {screen === "result" && report && (
          <section className={`result-layout ${resultView === "image" ? "image-view" : "report-view"}`}>
            <div className="result-view-tabs" role="tablist" aria-label="结果视图切换">
              <button
                type="button"
                className={resultView === "image" ? "active" : ""}
                onClick={() => setResultView("image")}
                role="tab"
                aria-selected={resultView === "image"}
              >
                总览
              </button>
              <button
                type="button"
                className={resultView === "report" ? "active" : ""}
                onClick={() => setResultView("report")}
                role="tab"
                aria-selected={resultView === "report"}
              >
                详细报告
              </button>
            </div>
            {resultView === "report" && (
              <article className="report panel">
              <div className="report-heading">
                <BadgeCheck size={24} />
                <div>
                  <p className="eyebrow">报告编号 {reportId}</p>
                  <h2>{catName}的猫格报告</h2>
                </div>
              </div>
              {safetyQuestions.some((_, index) => safetyFlags[index]) && (
                <div className="care-alert">
                  部分表现可能受到疼痛、疾病或近期压力影响。这份结果不能替代兽医检查，建议优先关注身体状况与生活环境变化。
                </div>
              )}
              <div className="report-profile">
                <div className="report-photo">
                  {photo ? <img src={photo} alt={`${catName}的照片`} /> : <Camera size={36} />}
                </div>
                <div>
                  <span>本次观测对象</span>
                  <strong>{catName}</strong>
                  <p>{profile.age || "年龄未填写"} · {profile.gender || "性别/状态未填写"} · {profile.family}</p>
                </div>
              </div>
              <p className="summary">{report.shortSummary}</p>
              <div className="identity-grid">
                <div>
                  <span>科学类型</span>
                  <strong>{report.personality.scientificType}</strong>
                </div>
                <div>
                  <span>趣味主称号</span>
                  <strong>{report.personality.mainTitle}</strong>
                </div>
                <div>
                  <span>关系风格</span>
                  <strong>{report.relationship.title}</strong>
                </div>
              </div>
              <div className="core-judgment">
                <span>一句核心判断</span>
                <strong>{report.personality.coreJudgment}</strong>
              </div>
              <div className="score-table">
                {(Object.keys(dimensions) as DimensionId[]).map((id) => (
                  <div key={id} className="score-row">
                    <div>
                      <strong>{dimensions[id].label}</strong>
                      <span>{dimensions[id].star} · {scoreBand(result.scores[id])}</span>
                    </div>
                    <div className="score-bar">
                      <span style={{ width: `${result.scores[id] ?? 18}%`, backgroundColor: dimensions[id].color }} />
                    </div>
                    <b>{result.scores[id] === null ? "不足" : result.scores[id]}</b>
                  </div>
                ))}
              </div>
              <div className="report-block">
                <h3>深度性格分析</h3>
                <div className="analysis-stack">
                  {reportParagraphs.slice(0, 3).map((paragraph, index) => (
                    <section key={paragraph}>
                      <h4>{["面对世界的方式", "核心性格张力", "行为线索汇总"][index] ?? "性格补充"}</h4>
                      <p>{paragraph}</p>
                    </section>
                  ))}
                </div>
              </div>
              <div className="report-block">
                <h3>猫咪与主人的关系分析</h3>
                <p>{report.relationship.summary}</p>
              </div>
              <div className="report-block">
                <h3>一个容易误解的地方</h3>
                <div className="misunderstanding-card">
                  <strong>{report.misunderstanding.ownerMayThink}</strong>
                  <p>{report.misunderstanding.betterExplanation}</p>
                </div>
              </div>
              <div className="report-block">
                <h3>相处建议</h3>
                <div className="advice-list">
                  {report.advice.slice(0, 5).map((item) => (
                    <section key={item.id}>
                      <strong>{item.title}</strong>
                      <p>{item.action}</p>
                      <small>{item.reason}</small>
                    </section>
                  ))}
                </div>
              </div>
              <div className="report-block">
                <h3>行为徽章</h3>
                <div className="badge-list">
                  {report.badges.map((badge) => (
                    <span key={badge.id}>{badge.label}</span>
                  ))}
                </div>
              </div>
              <div className="report-block">
                <h3>猫咪内心独白</h3>
                <blockquote>“{report.innerMonologue}”</blockquote>
                <p className="quote-line">{report.relationshipQuote}</p>
              </div>
              </article>
            )}

            {resultView === "image" && (
              <aside className="share-column">
              {isDemoPreview && (
                <label className="image-auth-code-field overview-auth-code-field" data-export-hidden="true">
                  <span>测试生图授权码</span>
                  <input
                    value={imageGenerationAuthCode}
                    onChange={(event) => setImageGenerationAuthCode(event.target.value)}
                    placeholder="输入授权码后生成像素猫"
                  />
                </label>
              )}
              <div className="result-image-tools" data-export-hidden="true">
                <label className={`secondary-button full upload-action ${photo ? "ready" : "missing"}`}>
                  <Upload size={17} />
                  {photo ? "更换猫咪照片" : "上传猫咪照片"}
                  <input type="file" accept="image/*" onChange={handlePhoto} />
                </label>
                <button className="image-gen-button full" onClick={generatePixelCatImage} disabled={imageGenerationStatus === "loading"}>
                  <Sparkles size={17} />
                  {imageGenerationStatus === "loading" ? "正在生成头像" : "生成像素猫头像"}
                </button>
                <button className="secondary-button full" onClick={openImageEditor} type="button">
                  <Pencil size={17} />
                  编辑像素猫头像
                </button>
                <button className="primary-button full" onClick={downloadCard}>
                  <Download size={18} />
                  保存图片
                </button>
                <button className="secondary-button full" onClick={resetTest}>
                  <RotateCcw size={17} />
                  重新测试
                </button>
              </div>
              {(imageGenerationStatus !== "idle" || imageGenerationNote) && (
                <div className={`image-gen-status-card overview-image-status ${imageGenerationTone}`} data-export-hidden="true">
                  <div>
                    <strong>{imageGenerationBadgeLabel}</strong>
                    <span>{imageGenerationNote || "像素猫头像状态"}</span>
                  </div>
                  {imageGenerationStatus === "loading" ? <Sparkles size={18} /> : <BadgeCheck size={18} />}
                </div>
              )}
              {!photo && (
                <p className="report-upload-hint" data-export-hidden="true">
                  生成 AI 像素猫前，请先上传一张脸部清楚的猫咪照片。
                </p>
              )}
              <div className="share-card poster-card" ref={cardRef}>
                <header className="poster-hero compact-hero">
                  <div className="poster-stars">猫格小像馆</div>
                  <p>{report.personality.mainTitle}</p>
                </header>

                <section className="poster-profile-grid">
                  <div className="poster-photo pixel-board pixel-bg-none">
                    {compositedAvatarImage ? (
                      <img className="composited-avatar-image" src={compositedAvatarImage} alt={`${catName}的合成像素头像`} />
                    ) : posterImage ? (
                      <div
                        className="cat-layer poster-cat-layer canvas-item"
                        style={{
                          left: `${catLayer.x}%`,
                          top: `${catLayer.y}%`,
                          transform: `translate(-50%, -50%) scale(${catLayer.scale})`,
                        }}
                      >
                        <img crossOrigin="anonymous" src={posterImage} alt={`${catName}的像素猫底图`} />
                      </div>
                    ) : <Camera size={52} />}
                    {!compositedAvatarImage && accessories.map((item) => {
                      return (
                        <div
                          key={item.uid}
                          className="accessory-sticker poster-sticker"
                          aria-label={getAccessoryLabel(item.accessoryId)}
                          style={{
                            "--accessory-size": `${getPosterAccessoryCanvasSize(item.accessoryId)}px`,
                            left: `${item.x}%`,
                            top: `${item.y}%`,
                            transform: `translate(-50%, -50%) scale(${item.scale})`,
                          } as CSSProperties}
                        >
                          <AccessoryIcon id={item.accessoryId} colors={item.colors} />
                        </div>
                      );
                    })}
                  </div>
                  <div className="poster-profile-card">
                    <div className="poster-name-card">
                      <span>猫咪</span>
                      <strong>{catName}</strong>
                    </div>
                    <div className="poster-score-row">
                      <div>
                        <span>综合分</span>
                        <strong>{posterScore}</strong>
                      </div>
                      <div>
                        <span>关系风格</span>
                        <strong>{report.relationship.title}</strong>
                      </div>
                    </div>
                    <div className="poster-mini-facts">
                      <span>{profile.gender || "性别未填"}</span>
                      <span>{profile.age || "年龄未填"}</span>
                    </div>
                  </div>
                </section>

                <section className="poster-title-band">
                  <span>{report.personality.scientificType}</span>
                  <p>{report.personality.coreJudgment}</p>
                  <div className="poster-stamp-row">
                    {topPosterDimensions.map((id) => {
                      const stamp = personalityStampMap[id];
                      return (
                        <div className="cat-type-stamp" key={id}>
                          <AccessoryIcon id={stamp.icon} />
                          <strong>{stamp.title}</strong>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="poster-section visual-summary">
                  <div className="poster-radar-summary">
                    <RadarChart scores={result.scores} />
                    <p>{report.shortSummary}</p>
                  </div>
                  <div className="poster-relationship-note">
                    <span>猫咪与主人的关系</span>
                    <strong>{report.relationship.title}</strong>
                    <p>{report.relationship.summary}</p>
                  </div>
                  <div className="poster-badge-strip">
                    {report.badges.slice(0, 3).map((badge) => <span key={badge.id}>{badge.label}</span>)}
                  </div>
                </section>

                <footer className="poster-footer">“{report.innerMonologue}”</footer>
              </div>
              </aside>
            )}
          </section>
        )}

        {screen === "result" && report && isImageEditorOpen && (
          <div className="image-editor-backdrop" role="dialog" aria-modal="true" aria-label="编辑猫猫头像">
            <section className="image-editor-panel">
              <header className="image-editor-header">
                <div>
                  <p className="eyebrow">Pixel Cat Studio</p>
                  <h2>编辑{catName}的猫猫头像</h2>
                </div>
                <div className="image-editor-header-actions">
                  <button className="primary-button editor-save-button" onClick={finishImageEditor}>
                    保存头像
                  </button>
                  <button className="icon-button" onClick={() => setIsImageEditorOpen(false)} aria-label="关闭编辑器">
                    <X size={18} />
                  </button>
                </div>
              </header>

              <div className="image-editor-body">
                <div
                  className="editor-stage accessory-stage pixel-board pixel-bg-none"
                  ref={editorPhotoRef}
                  onPointerDown={(event) => placeActiveAccessory(event, editorPhotoRef.current)}
                >
                  {posterImage ? (
                    <div
                      className={`cat-layer editor-cat-layer canvas-item ${isCatSelected ? "selected" : ""}`}
                      role="button"
                      tabIndex={0}
                      aria-label="移动猫猫头像"
                      style={{
                        left: `${catLayer.x}%`,
                        top: `${catLayer.y}%`,
                        transform: `translate(-50%, -50%) scale(${catLayer.scale})`,
                      }}
                      onPointerDown={(event) => beginCatDrag(event, editorPhotoRef.current)}
                      onPointerMove={(event) => dragCat(event, editorPhotoRef.current)}
                      onPointerUp={endCatDrag}
                      onPointerCancel={endCatDrag}
                    >
                      <img crossOrigin="anonymous" src={posterImage} alt={`${catName}的像素猫编辑底图`} />
                      {isCatSelected && (
                        <div className="canvas-item-controls" data-editor-control="true" aria-hidden="true">
                          <button
                            type="button"
                            className="canvas-corner delete"
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              removeCanvasItem("cat");
                            }}
                          >
                            <X size={12} />
                          </button>
                          {["tl", "bl", "br"].map((corner) => (
                            <button
                              key={corner}
                              type="button"
                              className={`canvas-corner resize ${corner}`}
                              onPointerDown={(event) => beginCanvasItemResize(event, "cat", editorPhotoRef.current)}
                              onPointerMove={(event) => resizeCanvasItem(event, editorPhotoRef.current)}
                              onPointerUp={endCanvasItemResize}
                              onPointerCancel={endCanvasItemResize}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : <Camera size={72} />}
                  {accessories.map((item) => {
                    return (
                      <div
                        key={item.uid}
                        className={`accessory-sticker editor-sticker canvas-item ${activeAccessoryUid === item.uid ? "selected" : ""}`}
                        role="button"
                        tabIndex={0}
                        aria-label={`移动${getAccessoryLabel(item.accessoryId)}`}
                        style={{
                          "--accessory-size": `${getAccessoryCanvasSize(item.accessoryId)}px`,
                          left: `${item.x}%`,
                          top: `${item.y}%`,
                          transform: `translate(-50%, -50%) scale(${item.scale})`,
                        } as CSSProperties}
                        onPointerDown={(event) => beginAccessoryDrag(event, item.uid, editorPhotoRef.current)}
                        onPointerMove={(event) => dragAccessory(event, item.uid, editorPhotoRef.current)}
                        onPointerUp={endAccessoryDrag}
                        onPointerCancel={endAccessoryDrag}
                      >
                        <AccessoryIcon id={item.accessoryId} colors={item.colors} />
                        {activeAccessoryUid === item.uid && (
                          <div className="canvas-item-controls" data-editor-control="true" aria-hidden="true">
                            <button
                              type="button"
                              className="canvas-corner delete"
                              onPointerDown={(event) => event.stopPropagation()}
                              onClick={(event) => {
                                event.stopPropagation();
                                removeCanvasItem("accessory", item.uid);
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <section className="editor-library-panel">
                  <div className="editor-library-title">
                    <strong>素材</strong>
                    <span>白色画板背景，点素材添加到画板。</span>
                  </div>
                  <div className="accessory-toolbar editor-accessory-toolbar">
                    {accessoryCatalog.map((item) => (
                      <button
                        key={item.id}
                        className={selectedAccessoryId === item.id ? "selected" : ""}
                        onClick={() => addAccessory(item.id)}
                        title={`${item.group} · ${item.label}`}
                      >
                        <AccessoryIcon id={item.id} />
                        <span>
                          <b>{item.label}</b>
                          <small>{item.group}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <aside className="editor-tools">
                  <div className="accessory-color-panel">
                    <div className="color-panel-head">
                      <strong>{activeAccessoryMeta.label}</strong>
                      <span>{activeAccessoryMeta.group}</span>
                    </div>
                    <div className="color-slot-grid">
                      {accessoryColorSlots.map((slot) => (
                        <label key={slot.id}>
                          <span>{slot.label}</span>
                          <input
                            type="color"
                            value={activeAccessoryColors[slot.id]}
                            onChange={(event) => updateActiveAccessoryColor(slot.id, event.target.value)}
                          />
                          <code>{activeAccessoryColors[slot.id]}</code>
                        </label>
                      ))}
                    </div>
                    <div className="palette-row">
                      {accessoryColorPalettes.map((palette) => (
                        <button key={palette.label} type="button" onClick={() => applyAccessoryPalette(palette.colors)} title={`使用${palette.label}色`}>
                          <span style={{ backgroundColor: palette.colors.primary }} />
                          <span style={{ backgroundColor: palette.colors.secondary }} />
                          <span style={{ backgroundColor: palette.colors.accent }} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="accessory-size-row editor-size-row">
                    <span>{activeAccessoryMeta.label}</span>
                    <button onClick={removeActiveAccessory} disabled={!activeAccessoryUid}>删除</button>
                    <button onClick={resetAccessories}>重置</button>
                  </div>
                  <div className="accessory-size-row cat-size-row">
                    <button onClick={() => resizeCat(-0.08)}>猫缩小</button>
                    <span>猫猫图层</span>
                    <button onClick={() => resizeCat(0.08)}>猫放大</button>
                  </div>
                  <div className={`result-photo-prompt ${photo ? "ready" : "missing"}`}>
                    <div>
                      <strong>{photo ? "当前参考图已就绪" : "生成前请上传猫咪正面照"}</strong>
                      <p>{photo ? "如果换照片，新的照片会覆盖档案页图片，并用于重新生成像素猫。" : "建议选择脸部清楚、光线稳定的猫咪正面照。"}</p>
                    </div>
                    <label className="secondary-button">
                      <Upload size={16} />
                      {photo ? "更换照片" : "上传照片"}
                      <input type="file" accept="image/*" onChange={handlePhoto} />
                    </label>
                  </div>
                  {isDemoPreview && (
                    <label className="image-auth-code-field">
                      <span>测试生图授权码</span>
                      <input
                        value={imageGenerationAuthCode}
                        onChange={(event) => setImageGenerationAuthCode(event.target.value)}
                        placeholder="输入真实授权码后再生成"
                      />
                    </label>
                  )}
                  <button className="image-gen-button" onClick={generatePixelCatImage} disabled={imageGenerationStatus === "loading"}>
                    <Sparkles size={17} />
                    {imageGenerationStatus === "loading" ? "正在生成底图" : "生成像素猫底图"}
                  </button>
                  {(imageGenerationStatus !== "idle" || imageGenerationNote) && (
                    <div className={`image-gen-status-card ${imageGenerationTone}`}>
                      <div>
                        <strong>{imageGenerationBadgeLabel}</strong>
                        <span>来源：{imageGenerationSourceLabel}</span>
                      </div>
                      {imageGenerationProvider === "ark-seedream" || imageGenerationProvider === "stored" ? (
                        <BadgeCheck size={18} />
                      ) : (
                        <Sparkles size={18} />
                      )}
                    </div>
                  )}
                  {imageGenerationNote && <p className={`image-gen-note ${imageGenerationStatus}`}>{imageGenerationNote}</p>}
                </aside>
              </div>
            </section>
          </div>
        )}

        {screen === "result" && !report && (
          <section className="panel report">
            <div className="report-heading">
              <BadgeCheck size={24} />
              <div>
                <p className="eyebrow">报告编号 {reportId}</p>
                <h2>还需要更多有效答案</h2>
              </div>
            </div>
            <p className="summary">有维度的有效核心题少于6道，暂时不能生成正式报告。请回到问卷，把“不确定”的题目补充到更接近日常表现的选项。</p>
            <div className="score-table">
              {(Object.keys(dimensions) as DimensionId[]).map((id) => (
                <div key={id} className="score-row">
                  <div>
                    <strong>{dimensions[id].label}</strong>
                    <span>已有效回答 {result.counts[id]} / 8</span>
                  </div>
                  <div className="score-bar">
                    <span style={{ width: `${Math.max(result.counts[id] * 12.5, 8)}%`, backgroundColor: dimensions[id].color }} />
                  </div>
                  <b>{result.scores[id] === null ? "不足" : result.scores[id]}</b>
                </div>
              ))}
            </div>
          </section>
        )}

        {screen !== "generating" && (
        <footer className="nav-actions">
          <button className="secondary-button" onClick={goBack} disabled={screen === "profile"}>
            <ArrowLeft size={17} />
            上一题
          </button>
          {screen === "profile" ? (
            <button className="primary-button" onClick={goNext}>
              开始答题
              <ArrowRight size={17} />
            </button>
          ) : screen === "result" ? (
            <button className="primary-button" onClick={downloadCard}>
              <Sparkles size={17} />
              导出图片
            </button>
          ) : null}
        </footer>
        )}
      </section>
    </main>
  );
}

function screenTitle(screen: Screen, name: string, questionIndex: number) {
  if (screen === "profile") return "先建立猫咪档案";
  if (screen === "generating") return "正在生成报告";
  if (screen === "result") return `${name}的猫格报告已生成`;
  return `第 ${questionIndex + 1} 题`;
}

function SingleQuestion({
  item,
  index,
  total,
  coreAnswers,
  relationshipAnswers,
  strategyAnswers,
  safetyFlags,
  onCoreAnswer,
  onRelationshipAnswer,
  onStrategyAnswer,
  onSafetyAnswer,
}: {
  item: TestItem;
  index: number;
  total: number;
  coreAnswers: Record<number, number | "unknown">;
  relationshipAnswers: Record<number, string>;
  strategyAnswers: Record<number, string>;
  safetyFlags: Record<number, boolean>;
  onCoreAnswer: (id: number, value: number | "unknown") => void;
  onRelationshipAnswer: (id: number, value: string) => void;
  onStrategyAnswer: (id: number, value: string) => void;
  onSafetyAnswer: (id: number, value: boolean) => void;
}) {
  if (item.kind === "core") {
    const question = item.question;
    return (
      <section className="panel single-question">
        <div className="question-meta">
          <span>{index + 1} / {total}</span>
          <span>{dimensions[question.dimension].label}</span>
        </div>
        <article className="question-card current-question">
          <div className="question-title">
            <span>{String(question.id).padStart(2, "0")}</span>
            <p>{question.text}</p>
          </div>
          <div className="scale-grid" role="radiogroup" aria-label={`第${question.id}题`}>
            {coreOptions.map((option) => (
              <button
                key={option.value}
                className={coreAnswers[question.id] === option.value ? "selected" : ""}
                onClick={() => onCoreAnswer(question.id, option.value)}
              >
                {option.label}
              </button>
            ))}
            <button className={coreAnswers[question.id] === "unknown" ? "selected" : ""} onClick={() => onCoreAnswer(question.id, "unknown")}>
              不确定
            </button>
          </div>
        </article>
      </section>
    );
  }

  if (item.kind === "safety") {
    return (
      <section className="panel single-question">
        <div className="question-meta">
          <span>{index + 1} / {total}</span>
          <span>近期变化提醒</span>
        </div>
        <article className="question-card current-question">
          <div className="question-title">
            <span>{String(item.id + 1).padStart(2, "0")}</span>
            <p>{item.text}</p>
          </div>
          <div className="binary-grid" role="radiogroup" aria-label={`近期变化第${item.id + 1}题`}>
            <button className={!safetyFlags[item.id] ? "selected" : ""} onClick={() => onSafetyAnswer(item.id, false)}>
              没有明显出现
            </button>
            <button className={safetyFlags[item.id] ? "selected" : ""} onClick={() => onSafetyAnswer(item.id, true)}>
              有，最近出现过
            </button>
          </div>
          <small>这道题不参与打分，只用于报告中的温和提醒。</small>
        </article>
      </section>
    );
  }

  const question = item.question;
  const answers = item.kind === "relationship" ? relationshipAnswers : strategyAnswers;
  const onAnswer = item.kind === "relationship" ? onRelationshipAnswer : onStrategyAnswer;

  return (
    <section className="panel single-question">
      <div className="question-meta">
        <span>{index + 1} / {total}</span>
        <span>{item.kind === "relationship" ? "关系行为" : "隐藏策略"}</span>
      </div>
      <article className="question-card current-question choice-card">
        <div className="question-title">
          <span>{question.id}</span>
          <p>{question.text}</p>
        </div>
        <div className="choice-list">
          {Object.entries(question.options).map(([key, value]) => (
            <button key={key} className={answers[question.id] === key ? "selected" : ""} onClick={() => onAnswer(question.id, key)}>
              <b>{key}</b>
              {value}
            </button>
          ))}
        </div>
        <small>{question.use}</small>
      </article>
    </section>
  );
}

function deriveRelationshipStyle(answers: Record<number, string>) {
  if (answers[50] === "A") return "身体依附型";
  if (answers[49] === "A") return "近距离信任型";
  if (answers[49] === "B") return "陪伴留退路型";
  if (answers[49] === "C") return "共享空间型";
  if (answers[49] === "D") return "守望陪伴型";
  if (answers[51] === "A" || answers[51] === "B") return "气味依恋型";
  if (answers[49] === "E") return "独立休息型";
  return "自主亲近型";
}

function deriveRelationshipTitle(answers: Record<number, string>) {
  if (answers[50] === "A") return "贴身信任使者";
  if (answers[49] === "A") return "枕边巡夜战士";
  if (answers[49] === "B") return "床尾巡航员";
  if (answers[49] === "C") return "同床守距观察员";
  if (answers[49] === "D") return "同房护航员";
  if (answers[51] === "A" || answers[51] === "B") return "气味收藏家";
  if (answers[49] === "E") return "独立休息专家";
  return "高边界贴贴战士";
}

function deriveSignalTitle(answers: Record<number, string>) {
  if (answers[54] === "A" || answers[54] === "B") return "慢眨眼信任使者";
  if (answers[55] === "A" || answers[55] === "B") return "脸颊盖章专员";
  if (answers[53] === "A" || answers[60] === "A") return "随行确认护卫";
  if (answers[57] === "E") return "键盘占领战士";
  return "安静观测搭档";
}

function relationshipCopy(answers: Record<number, string>, name: string) {
  const sleep = answers[49];
  const blink = answers[54];
  const rub = answers[55];
  const follow = answers[53];
  const reunion = answers[52];
  const parts = [];
  if (sleep === "A" || sleep === "B" || sleep === "C") {
    parts.push(`${name}愿意把睡眠位置放进与你相邻的安全范围，但具体距离仍会受到温度、退路和长期习惯影响。`);
  } else if (sleep === "D") {
    parts.push(`${name}更像是同房守望式陪伴，保留自己的位置，同时让你在它的安全地图里。`);
  } else {
    parts.push(`${name}倾向在固定窝或其他房间休息，这不等于关系疏远，更可能是它对睡眠安全点的稳定偏好。`);
  }
  if (blink === "A" || blink === "B" || rub === "A" || rub === "B") {
    parts.push("慢眨眼、柔和回望或蹭脸行为说明它会用低强度、放松的方式表达亲近。");
  }
  if (follow === "A" || follow === "B" || reunion === "A" || reunion === "B") {
    parts.push("重逢和移动时的靠近，显示它会通过位置确认来维持关系。");
  }
  return parts.join("");
}

function conflictCopy(top: DimensionId, second: DimensionId, name: string) {
  if ([top, second].includes("attachment") && [top, second].includes("autonomy")) {
    return `${name}可能同时需要亲近和边界，这不是矛盾。它想靠近重要的人，但更希望由自己决定靠近方式。`;
  }
  if ([top, second].includes("perception") && [top, second].includes("social")) {
    return `${name}并非简单胆小或外向，它可能会先完成安全检查，再选择是否进入社交。`;
  }
  if ([top, second].includes("exploration") && [top, second].includes("stability")) {
    return `${name}的好奇心和恢复力可以共存，适合用可控的新鲜感丰富日常。`;
  }
  return `${name}的主要倾向之间没有明显冲突，重点是尊重它在不同情境下的节奏变化。`;
}
