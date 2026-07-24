"use client";

import { toPng } from "html-to-image";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  Download,
  FileText,
  LockKeyhole,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";

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

const ACCESS_CODES = ["CATSTAR2026", "MEOW2026", "猫咪星轨"];

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
  "perception|social": { name: "礼貌侦察官", line: "先观察、再靠近，社交前总要完成安全检查。" },
  "autonomy|perception": { name: "边境守夜人", line: "边界清晰，认真记录周围每一处变化。" },
  "perception|stability": { name: "静夜雷达员", line: "感知敏锐，但内在节奏沉稳。" },
  "attachment|exploration": { name: "跟随远征家", line: "既想探索世界，也喜欢确认你在附近。" },
  "exploration|social": { name: "星际外交探险家", line: "对新事物和新朋友都保持兴趣。" },
  "autonomy|exploration": { name: "独立开路者", line: "好奇心强，也坚持按自己的方法前进。" },
  "exploration|stability": { name: "恒星远行者", line: "敢于研究新事物，同时拥有稳定恢复力。" },
  "attachment|social": { name: "暖星外交官", line: "愿意回应善意，也重视共享陪伴。" },
  "attachment|autonomy": { name: "有边界的陪伴者", line: "深爱靠近，但要自己决定靠近方式。" },
  "attachment|stability": { name: "归巢守护者", line: "关系稳定、陪伴持续，是温和的长期主义者。" },
  "autonomy|social": { name: "选择性社交指挥官", line: "愿意交朋友，但互动规则由自己制定。" },
  "social|stability": { name: "温柔接待员", line: "面对关系开放，整体反应平稳可预测。" },
  "autonomy|stability": { name: "静默领航员", line: "不依赖持续关注，也清楚自己的节奏和边界。" },
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

const steps = [
  { id: "intro", label: "档案" },
  { id: "perception", label: "感知力" },
  { id: "exploration", label: "探索力" },
  { id: "attachment", label: "依附力" },
  { id: "social", label: "社交力" },
  { id: "autonomy", label: "自主力" },
  { id: "stability", label: "稳定力" },
  { id: "relationship", label: "关系" },
  { id: "strategy", label: "彩蛋" },
  { id: "safety", label: "提醒" },
  { id: "result", label: "报告" },
];

function scoreBand(score: number | null) {
  if (score === null) return "信息不足";
  if (score <= 32) return "偏低倾向";
  if (score <= 67) return "典型范围";
  return "偏高倾向";
}

function sortedPair(a: DimensionId, b: DimensionId) {
  return [a, b].sort().join("|");
}

function dimensionText(score: number | null, id: DimensionId) {
  if (score === null) return "这一维度有效答案不足，建议补充观察后再解读。";
  if (score <= 32) return dimensions[id].low;
  if (score <= 67) return dimensions[id].mid;
  return dimensions[id].high;
}

function makeId() {
  return `CAT-${new Date().getFullYear()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
}

function RadarChart({ scores }: { scores: Record<DimensionId, number | null> }) {
  const ids = Object.keys(dimensions) as DimensionId[];
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
      {[0.25, 0.5, 0.75, 1].map((level) => {
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
  const [accessError, setAccessError] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: "",
    gender: "",
    arrival: "",
    family: "单猫家庭",
  });
  const [photo, setPhoto] = useState<string>("");
  const [coreAnswers, setCoreAnswers] = useState<Record<number, number | "unknown">>({});
  const [relationshipAnswers, setRelationshipAnswers] = useState<Record<number, string>>({});
  const [strategyAnswers, setStrategyAnswers] = useState<Record<number, string>>({});
  const [safetyFlags, setSafetyFlags] = useState<Record<number, boolean>>({});
  const [reportId, setReportId] = useState(makeId);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentStep = steps[stepIndex];
  const catName = profile.name.trim() || "这只小猫";

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

    const sortable = (Object.keys(scores) as DimensionId[])
      .filter((id) => scores[id] !== null)
      .sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
    const top = sortable[0] ?? "attachment";
    const second = sortable[1] ?? "stability";
    const low = [...sortable].reverse()[0] ?? "social";
    const type = typeMap[sortedPair(top, second)] ?? { name: "星轨观察员", line: "它的行为画像比较均衡，许多表达会随情境切换。" };

    const relationTag = deriveRelationshipTag(relationshipAnswers);
    const strategyList = strategyQuestions
      .map((question) => {
        const answer = strategyAnswers[question.id];
        return answer ? strategyTags[question.id][answer] : null;
      })
      .filter((item): item is { tag: string; monologue: string } => item !== null);
    const strategy = strategyList.at(-1) ?? { tag: "星轨观察员", monologue: "我的每一步，都有一点自己的理由。" };
    const validCore = Object.values(coreAnswers).filter((value) => value !== "unknown").length;
    const relationUnknown = Object.entries(relationshipAnswers).filter(([id, value]) => {
      const option = relationshipQuestions.find((q) => q.id === Number(id))?.options[value] ?? "";
      return option.includes("未观察") || option.includes("没有留意") || option.includes("不确定");
    }).length;
    const reliability = safetyQuestions.some((_, index) => safetyFlags[index]) || validCore < 38 || relationUnknown > 3
      ? "中"
      : validCore >= 44
        ? "高"
        : "中";

    return {
      scores,
      counts,
      top,
      second,
      low,
      type,
      relationTag,
      strategy,
      strategyList,
      reliability,
      title: `${type.name} · ${relationTag}`,
      subtitle: `${type.line} 带着一点${lowModifiers[low]}的底色。`,
      mainStars: [dimensions[top].star, dimensions[second].star, dimensions[low].star],
    };
  }, [coreAnswers, relationshipAnswers, safetyFlags, strategyAnswers]);

  function authorize() {
    if (ACCESS_CODES.includes(accessCode.trim())) {
      setAuthorized(true);
      setAccessError("");
    } else {
      setAccessError("授权码暂未识别。可试用：CATSTAR2026");
    }
  }

  function updateProfile(field: keyof Profile, value: string) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function downloadCard() {
    if (!cardRef.current) return;
    const image = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#10172a" });
    const link = document.createElement("a");
    link.download = `${catName}-猫咪星轨图.png`;
    link.href = image;
    link.click();
  }

  function resetTest() {
    setStepIndex(0);
    setCoreAnswers({});
    setRelationshipAnswers({});
    setStrategyAnswers({});
    setSafetyFlags({});
    setReportId(makeId());
  }

  if (!authorized) {
    return (
      <main className="gate-page">
        <section className="gate-panel">
          <div className="brand-mark">
            <Moon size={22} />
            <span>猫咪星轨录</span>
          </div>
          <div className="gate-copy">
            <p className="eyebrow">Cat Startrail Profile</p>
            <h1>输入授权码，开启猫咪的星轨档案</h1>
            <p>
              完成一组基于日常观察的题目，上传猫咪照片，生成六维性格报告与可保存的星轨分享图。
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
          <p className="quiet-note">当前版本为静态演示站，所有照片与答案仅在本机浏览器中处理。</p>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="side-rail" aria-label="测试进度">
        <div className="brand-mark">
          <Moon size={20} />
          <span>猫咪星轨录</span>
        </div>
        <div className="progress-list">
          {steps.map((step, index) => (
            <button
              key={step.id}
              className={`progress-item ${index === stepIndex ? "active" : ""} ${index < stepIndex ? "done" : ""}`}
              onClick={() => setStepIndex(index)}
            >
              <span>{index < stepIndex ? <Check size={14} /> : index + 1}</span>
              {step.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="work-area">
        <header className="top-bar">
          <div>
            <p className="eyebrow">{currentStep.label}</p>
            <h1>{stepTitle(currentStep.id, catName)}</h1>
          </div>
          <div className="meter" aria-label="完成进度">
            <span style={{ width: `${(stepIndex / (steps.length - 1)) * 100}%` }} />
          </div>
        </header>

        {currentStep.id === "intro" && (
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
            </div>
          </section>
        )}

        {isDimensionStep(currentStep.id) && (
          <QuestionPanel
            questions={coreQuestions.filter((question) => question.dimension === currentStep.id)}
            answers={coreAnswers}
            onAnswer={(id, value) => setCoreAnswers((current) => ({ ...current, [id]: value }))}
          />
        )}

        {currentStep.id === "relationship" && (
          <ChoicePanel
            questions={relationshipQuestions}
            answers={relationshipAnswers}
            onAnswer={(id, value) => setRelationshipAnswers((current) => ({ ...current, [id]: value }))}
          />
        )}

        {currentStep.id === "strategy" && (
          <ChoicePanel
            questions={strategyQuestions}
            answers={strategyAnswers}
            onAnswer={(id, value) => setStrategyAnswers((current) => ({ ...current, [id]: value }))}
          />
        )}

        {currentStep.id === "safety" && (
          <section className="panel">
            <div className="section-intro">
              <h2>近期变化提醒</h2>
              <p>这些项目不参与打分，只用于在报告中加入温和提醒，避免把健康或压力信号娱乐化。</p>
            </div>
            <div className="safety-list">
              {safetyQuestions.map((question, index) => (
                <label key={question} className="safety-row">
                  <input
                    type="checkbox"
                    checked={Boolean(safetyFlags[index])}
                    onChange={(event) => setSafetyFlags((current) => ({ ...current, [index]: event.target.checked }))}
                  />
                  <span>{question}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {currentStep.id === "result" && (
          <section className="result-layout">
            <article className="report panel">
              <div className="report-heading">
                <BadgeCheck size={24} />
                <div>
                  <p className="eyebrow">报告编号 {reportId}</p>
                  <h2>{catName}的星轨报告</h2>
                </div>
              </div>
              {safetyQuestions.some((_, index) => safetyFlags[index]) && (
                <div className="care-alert">
                  部分表现可能受到疼痛、疾病或近期压力影响。这份结果不能替代兽医检查，建议优先关注身体状况与生活环境变化。
                </div>
              )}
              <p className="summary">{result.subtitle}</p>
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
                <h3>核心性格分析</h3>
                <p>
                  {catName}的主导星轨落在{dimensions[result.top].label}与{dimensions[result.second].label}之间。
                  {dimensionText(result.scores[result.top], result.top)}
                  {" "}{dimensionText(result.scores[result.second], result.second)}
                </p>
              </div>
              <div className="report-block">
                <h3>关系行为分析</h3>
                <p>{relationshipCopy(relationshipAnswers, catName)}</p>
              </div>
              <div className="report-block">
                <h3>性格冲突点</h3>
                <p>{conflictCopy(result.top, result.second, catName)}</p>
              </div>
              <div className="report-block">
                <h3>生活建议</h3>
                <ul>
                  <li>{dimensions[result.top].advice}</li>
                  <li>{dimensions[result.low].advice}</li>
                  <li>当行为突然变化、食欲或猫砂盆习惯明显改变时，优先排查身体不适与压力源。</li>
                </ul>
              </div>
            </article>

            <aside className="share-column">
              <div className="share-card" ref={cardRef}>
                <div className="starfield" />
                <div className="share-header">
                  <span>猫咪星轨录</span>
                  <span>{reportId}</span>
                </div>
                <div className="share-photo">
                  {photo ? <img src={photo} alt={`${catName}的照片`} /> : <Camera size={52} />}
                </div>
                <p className="share-name">{catName}</p>
                <h2>{result.title}</h2>
                <p className="share-line">{result.type.line}</p>
                <RadarChart scores={result.scores} />
                <div className="tag-row">
                  {result.mainStars.map((star) => <span key={star}>{star}</span>)}
                  <span>{result.strategy.tag}</span>
                </div>
                <blockquote>“{result.strategy.monologue}”</blockquote>
              </div>
              <button className="primary-button full" onClick={downloadCard}>
                <Download size={18} />
                保存星轨图
              </button>
              <button className="secondary-button full" onClick={resetTest}>
                <RotateCcw size={17} />
                重新测试
              </button>
            </aside>
          </section>
        )}

        <footer className="nav-actions">
          <button className="secondary-button" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0}>
            <ArrowLeft size={17} />
            上一步
          </button>
          {stepIndex < steps.length - 1 ? (
            <button className="primary-button" onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))}>
              下一步
              <ArrowRight size={17} />
            </button>
          ) : (
            <button className="primary-button" onClick={downloadCard}>
              <Sparkles size={17} />
              导出图片
            </button>
          )}
        </footer>
      </section>
    </main>
  );
}

function isDimensionStep(id: string): id is DimensionId {
  return Object.keys(dimensions).includes(id);
}

function stepTitle(id: string, name: string) {
  if (id === "intro") return "先建立猫咪档案";
  if (id === "relationship") return "它如何与你建立关系";
  if (id === "strategy") return "隐藏策略与趣味彩蛋";
  if (id === "safety") return "近期变化与健康提醒";
  if (id === "result") return `${name}的星轨报告已生成`;
  if (isDimensionStep(id)) return `${dimensions[id].label}观察`;
  return "猫咪星轨测试";
}

function QuestionPanel({
  questions,
  answers,
  onAnswer,
}: {
  questions: Question[];
  answers: Record<number, number | "unknown">;
  onAnswer: (id: number, value: number | "unknown") => void;
}) {
  return (
    <section className="panel question-stack">
      <div className="section-intro">
        <h2>{dimensions[questions[0].dimension].axis}</h2>
        <p>每题都按日常可观察行为作答，不确定或没观察过可以跳过。</p>
      </div>
      {questions.map((question) => (
        <article key={question.id} className="question-card">
          <div className="question-title">
            <span>{String(question.id).padStart(2, "0")}</span>
            <p>{question.text}</p>
          </div>
          <div className="scale-grid" role="radiogroup" aria-label={`第${question.id}题`}>
            {coreOptions.map((option) => (
              <button
                key={option.value}
                className={answers[question.id] === option.value ? "selected" : ""}
                onClick={() => onAnswer(question.id, option.value)}
              >
                {option.label}
              </button>
            ))}
            <button className={answers[question.id] === "unknown" ? "selected" : ""} onClick={() => onAnswer(question.id, "unknown")}>
              不确定
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function ChoicePanel({
  questions,
  answers,
  onAnswer,
}: {
  questions: ChoiceQuestion[];
  answers: Record<number, string>;
  onAnswer: (id: number, value: string) => void;
}) {
  return (
    <section className="panel question-stack">
      <div className="section-intro">
        <h2>选择最接近的日常表现</h2>
        <p>这些题用于生成关系类型、趣味称号和内心独白，不直接改变六维分数。</p>
      </div>
      {questions.map((question) => (
        <article key={question.id} className="question-card choice-card">
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
      ))}
    </section>
  );
}

function deriveRelationshipTag(answers: Record<number, string>) {
  if (answers[49] === "A" || answers[50] === "A") return "枕边贴贴型";
  if (answers[49] === "B") return "床尾护航型";
  if (answers[49] === "D" || answers[53] === "B") return "同房守望型";
  if (answers[51] === "A" || answers[51] === "B") return "气味依附型";
  if (answers[53] === "A" || answers[65] === "C") return "跟随确认型";
  if (answers[49] === "E") return "独立共享型";
  return "高边界亲近型";
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
