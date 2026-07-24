import type {
  AdviceItem,
  BadgeRule,
  DimensionId,
  EvidenceRule,
  PersonalityTemplate,
  RelationshipTemplate,
} from "./cat-report-model";

export const DIMENSION_ORDER: DimensionId[] = [
  "sensitivity",
  "exploration",
  "attachment",
  "sociability",
  "autonomy",
  "stability",
];

export const DIMENSION_META: Record<
  DimensionId,
  {
    label: string;
    shortDescription: string;
    lowPole: string;
    highPole: string;
  }
> = {
  sensitivity: {
    label: "感知力",
    shortDescription: "对声音、气味、陌生人和环境变化的关注程度",
    lowPole: "松弛大胆",
    highPole: "敏锐谨慎",
  },
  exploration: {
    label: "探索力",
    shortDescription: "主动调查新事物、空间和问题的倾向",
    lowPole: "熟悉偏好",
    highPole: "新奇探索",
  },
  attachment: {
    label: "依附力",
    shortDescription: "主动靠近、跟随和共享空间的倾向",
    lowPole: "独立相处",
    highPole: "陪伴依恋",
  },
  sociability: {
    label: "社交力",
    shortDescription: "接受陌生人和新关系的开放程度",
    lowPole: "选择社交",
    highPole: "开放社交",
  },
  autonomy: {
    label: "自主力",
    shortDescription: "对身体边界、个人空间和选择权的重视程度",
    lowPole: "随和接触",
    highPole: "自主边界",
  },
  stability: {
    label: "稳定力",
    shortDescription: "受到刺激后的恢复速度与行为可预测性",
    lowPole: "状态多变",
    highPole: "稳定复原",
  },
};

export const CORE_QUESTION_IDS: Record<DimensionId, number[]> = {
  sensitivity: [1, 2, 3, 4, 5, 6, 7, 8],
  exploration: [9, 10, 11, 12, 13, 14, 15, 16],
  attachment: [17, 18, 19, 20, 21, 22, 23, 24],
  sociability: [25, 26, 27, 28, 29, 30, 31, 32],
  autonomy: [33, 34, 35, 36, 37, 38, 39, 40],
  stability: [41, 42, 43, 44, 45, 46, 47, 48],
};

export const REVERSE_QUESTION_IDS = new Set<number>([
  7, 8, 15, 16, 23, 24, 31, 32, 39, 40, 47, 48,
]);

export const BALANCED_PERSONALITY: PersonalityTemplate = {
  id: "balanced_adaptor",
  dimensions: [],
  scientificType: "均衡适应型猫咪",
  mainTitle: "会看情况切换模式的全能室友",
  coreJudgment: "它没有被某一种性格牢牢定义，而是很会根据环境调整自己的模式。",
  worldAnalysis:
    "它在谨慎与探索、陪伴与独处之间都保留了弹性。面对熟悉场景时，它可能十分放松；环境发生变化时，又能根据当下安全感决定靠近、观察或暂时退出。",
  conflictAnalysis:
    "它看起来偶尔前后不一致，往往不是性格反复，而是不同情境唤起了不同的应对方式。对它来说，灵活调整本身就是稳定的一部分。",
  posterSummary:
    "它不会永远只用一种方式面对世界。该观察时观察，该靠近时靠近，也知道什么时候回到自己的位置。",
};

export const SINGLE_DIMENSION_PERSONALITIES: Record<DimensionId, PersonalityTemplate> = {
  sensitivity: {
    id: "sensitivity_dominant",
    dimensions: ["sensitivity"],
    scientificType: "高感知观察型猫咪",
    mainTitle: "风吹草动都要登记的环境雷达员",
    coreJudgment: "它总能比别人更早发现，房间里有什么不一样。",
    worldAnalysis:
      "声音、气味、家具位置和人的动作，都会迅速进入它的注意范围。它习惯先收集信息，再决定是否继续休息、靠近或离开。",
    conflictAnalysis:
      "这种敏锐不等于胆小。它只是需要比别的猫更完整地确认环境，才能真正放松下来。",
    posterSummary:
      "它的雷达几乎全天在线。不是爱紧张，而是不愿错过任何值得确认的变化。",
  },
  exploration: {
    id: "exploration_dominant",
    dimensions: ["exploration"],
    scientificType: "高探索驱动型猫咪",
    mainTitle: "什么都要亲自看一眼的开荒先锋",
    coreJudgment: "只要世界出现一个新入口，它就很难假装没有看见。",
    worldAnalysis:
      "新纸箱、新柜门、新玩具和暂时拿不到的目标，都容易激起它的行动欲。它不仅会靠近，还愿意换方法、重复尝试，直到弄明白为止。",
    conflictAnalysis:
      "它的活跃不只是精力旺盛，更包含明显的问题解决动机。比起被动接受安排，它更喜欢自己发现答案。",
    posterSummary:
      "它对未知最大的尊重，就是亲自进去看一眼。",
  },
  attachment: {
    id: "attachment_dominant",
    dimensions: ["attachment"],
    scientificType: "高陪伴依恋型猫咪",
    mainTitle: "随时确认你在不在的贴身跟班",
    coreJudgment: "它不一定时时贴着你，但会不断确认你仍在自己的生活范围里。",
    worldAnalysis:
      "主动靠近、跟随、迎接和共享空间，是它建立安全感的重要方式。你的位置、声音和日常节奏，已经成为它环境的一部分。",
    conflictAnalysis:
      "高依附不等于无法独处。它真正需要的是关系稳定、回应可预测，而不是每一分钟都被抱在怀里。",
    posterSummary:
      "它把你写进了自己的日常地图，所以总要偶尔确认一下坐标。",
  },
  sociability: {
    id: "sociability_dominant",
    dimensions: ["sociability"],
    scientificType: "高开放社交型猫咪",
    mainTitle: "见谁都想认识一下的欢迎部长",
    coreJudgment: "它对新关系的第一反应，通常不是拒绝，而是想先认识一下。",
    worldAnalysis:
      "面对访客、家庭成员或新的照顾者，它较容易从观察进入互动。它能从温和的声音、姿态和重复见面中快速建立熟悉感。",
    conflictAnalysis:
      "会社交不代表可以被任何人随意触碰。开放与边界可以同时存在，友好也仍需要尊重停止信号。",
    posterSummary:
      "它愿意给新朋友一次面试机会，而且通过率通常不低。",
  },
  autonomy: {
    id: "autonomy_dominant",
    dimensions: ["autonomy"],
    scientificType: "高自主边界型猫咪",
    mainTitle: "生活必须自己做主的独立店长",
    coreJudgment: "它可以很亲近，但互动方式必须经过它本人同意。",
    worldAnalysis:
      "它重视固定位置、个人空间和身体选择权。主动走近时可能十分温柔，被突然抱起或中断行动时却会明确退出。",
    conflictAnalysis:
      "这种边界不是疏远，而是一种清楚的沟通方式。越能保留选择权，它越容易主动回来。",
    posterSummary:
      "可以贴贴，但请尊重本店营业时间和接触流程。",
  },
  stability: {
    id: "stability_dominant",
    dimensions: ["stability"],
    scientificType: "高稳定复原型猫咪",
    mainTitle: "天塌下来也先按节奏生活的稳定室友",
    coreJudgment: "它不是没有情绪，而是很少让一次刺激打乱整个生活节奏。",
    worldAnalysis:
      "相似情境下，它的反应较容易预测。兴奋、惊吓或不愉快护理结束后，它通常能够逐步回到原本的休息、进食或互动状态。",
    conflictAnalysis:
      "稳定不意味着什么都能承受。它只是拥有较好的恢复方式，仍然需要休息点、规律和清晰的边界。",
    posterSummary:
      "有事会处理，处理完继续吃饭睡觉，这就是它的生活哲学。",
  },
};

export const PAIR_PERSONALITIES: PersonalityTemplate[] = [
  {
    id: "sensitivity_exploration",
    dimensions: ["sensitivity", "exploration"],
    scientificType: "谨慎探索型猫咪",
    mainTitle: "先观察再出手的好奇侦探",
    coreJudgment: "它对世界很警觉，却总忍不住亲自靠近。",
    worldAnalysis:
      "新声音、新气味或新物品出现时，它通常先停下来判断风险，而不是立刻冲上去。可一旦确认环境仍在掌控之中，好奇心就会接管行动，让它靠近、闻嗅、绕行并完成调查。",
    conflictAnalysis:
      "它最大的性格张力，是谨慎和好奇同时很强。先后退再靠近并不矛盾：后退是在收集信息，靠近则说明它已经完成了安全判断。",
    posterSummary:
      "它会先检查整个世界，再决定从哪条路线靠近。谨慎不是退缩，而是它开始探索前的准备工作。",
  },
  {
    id: "sensitivity_attachment",
    dimensions: ["sensitivity", "attachment"],
    scientificType: "慢热守护型猫咪",
    mainTitle: "把信任只留给重要对象的守夜员",
    coreJudgment: "它对外界保留戒心，却会把熟悉的人认真划进安全范围。",
    worldAnalysis:
      "面对陌生变化时，它倾向于先观察和拉开距离；面对熟悉照顾者时，它又会通过靠近、跟随或共享空间确认关系。你对它而言不仅是互动对象，也是稳定环境的一部分。",
    conflictAnalysis:
      "它不是一边胆小一边黏人，而是把谨慎用于筛选关系。越是信任少数人，它对这些人的依赖和关注往往越稳定。",
    posterSummary:
      "它不是对所有人冷淡，只是把有限的信任额度认真留给了熟人。",
  },
  {
    id: "sensitivity_sociability",
    dimensions: ["sensitivity", "sociability"],
    scientificType: "谨慎社交型猫咪",
    mainTitle: "先审核再营业的礼貌接待员",
    coreJudgment: "它愿意认识新朋友，但见面前必须先完成安全审核。",
    worldAnalysis:
      "陌生人出现时，它会关注动作、声音和距离，通常不急于直接接触。但只要对方足够安静、可预测，它又能逐渐靠近并建立新的互动。",
    conflictAnalysis:
      "它的社交不是毫无防备的热情，而是建立在判断之上的开放。观察时间越充分，后续的友好越自然。",
    posterSummary:
      "欢迎来访，但请先坐好，等待本店完成访客审核。",
  },
  {
    id: "sensitivity_autonomy",
    dimensions: ["sensitivity", "autonomy"],
    scientificType: "高边界警觉型猫咪",
    mainTitle: "风吹草动都要检查的边界管理员",
    coreJudgment: "它既在意周围发生什么，也在意谁有权进入自己的空间。",
    worldAnalysis:
      "它会留意环境变化、动线和陌生靠近，同时对休息点、身体接触和退出路线有清晰偏好。安全感来自两个条件：周围可预测，自己仍有选择。",
    conflictAnalysis:
      "它的警觉与边界并不是拒绝关系，而是在建立一套可控的相处秩序。被尊重以后，它反而更容易放松。",
    posterSummary:
      "环境要检查，边界要登记，靠近当然可以，但请走正规流程。",
  },
  {
    id: "sensitivity_stability",
    dimensions: ["sensitivity", "stability"],
    scientificType: "敏锐稳定型猫咪",
    mainTitle: "雷达常开但内心不慌的值班员",
    coreJudgment: "它什么都能注意到，却不容易被每一点变化长期带走。",
    worldAnalysis:
      "它会迅速发现声音、气味和空间变化，但在完成判断之后，通常能够重新回到休息、进食或原有活动。敏锐负责发现，稳定负责收尾。",
    conflictAnalysis:
      "看起来经常警觉，不代表它一直处于压力中。真正重要的是，它是否能在刺激结束后恢复自己的节奏。",
    posterSummary:
      "雷达负责报警，内心负责判断是否真的需要起床。",
  },
  {
    id: "exploration_attachment",
    dimensions: ["exploration", "attachment"],
    scientificType: "陪伴探索型猫咪",
    mainTitle: "出门调查也要确认你在的跟随侦探",
    coreJudgment: "它想把世界研究明白，也希望抬头时能确认你仍在附近。",
    worldAnalysis:
      "它会主动追逐新鲜事物、检查空间和解决小问题，同时也倾向于跟随照顾者、共享房间或在探索间隙重新靠近。陪伴是它行动地图里的安全坐标。",
    conflictAnalysis:
      "它不是只能黏着你才敢行动，而是把独立探索和关系确认交替进行。走远一点，再回来确认一次，是它熟悉的节奏。",
    posterSummary:
      "它负责调查未知，你负责留在地图上当那个永远找得到的坐标。",
  },
  {
    id: "exploration_sociability",
    dimensions: ["exploration", "sociability"],
    scientificType: "开放探索型猫咪",
    mainTitle: "新朋友和新纸箱都想认识的热情调查员",
    coreJudgment: "对它来说，新事物和新关系都值得先靠近看看。",
    worldAnalysis:
      "它容易被新的空间、物品和人吸引，也较愿意从观察进入互动。环境越丰富、反馈越温和，它越容易表现出主动、活跃和开放。",
    conflictAnalysis:
      "它的热情可能让人误以为它接受所有形式的接触，但探索和社交仍需要退出通道。允许它随时结束，才能保持长期兴趣。",
    posterSummary:
      "新纸箱要检查，新客人也要认识，今天的行程依然很满。",
  },
  {
    id: "exploration_autonomy",
    dimensions: ["exploration", "autonomy"],
    scientificType: "自主探索型猫咪",
    mainTitle: "谁也别安排路线的独立开路者",
    coreJudgment: "它对世界充满兴趣，但坚持用自己的办法抵达答案。",
    worldAnalysis:
      "它愿意主动调查新环境、寻找入口和解决问题，却不喜欢被抱着送到目标面前。发现、尝试和退出都由自己决定，才是它享受探索的方式。",
    conflictAnalysis:
      "它并非拒绝帮助，而是不希望帮助变成控制。给它安全选择和试错空间，比直接代替它完成更有效。",
    posterSummary:
      "目的地可以推荐，路线请交给本猫自己规划。",
  },
  {
    id: "exploration_stability",
    dimensions: ["exploration", "stability"],
    scientificType: "稳定探索型猫咪",
    mainTitle: "好奇但不莽撞的长期调查员",
    coreJudgment: "它愿意不断接触新鲜事物，也能在兴奋后找回自己的节奏。",
    worldAnalysis:
      "面对新目标，它通常有持续兴趣和行动力；玩耍、调查或短暂受惊之后，又能逐步恢复到熟悉状态。这让它既能拓展环境，也不容易长期失去秩序。",
    conflictAnalysis:
      "它的探索不是一时冲动，而更像稳定开展的长期项目。适度轮换和可预测的新鲜感，会比一次塞进太多刺激更适合它。",
    posterSummary:
      "今天研究纸箱，明天研究柜门，项目很多，但作息照常。",
  },
  {
    id: "attachment_sociability",
    dimensions: ["attachment", "sociability"],
    scientificType: "亲和社交型猫咪",
    mainTitle: "全家都要打招呼的欢迎部长",
    coreJudgment: "它重视熟悉关系，也愿意把友好延伸给更多人。",
    worldAnalysis:
      "它会主动共享空间、回应照顾者，也较容易接受家庭成员、访客或新的照顾对象。关系互动本身，是它生活中重要而有吸引力的部分。",
    conflictAnalysis:
      "它的开放不代表没有偏爱。它可能对很多人友好，却仍会把最稳定的跟随、休息位置和信任信号留给核心照顾者。",
    posterSummary:
      "它负责让全家感受到欢迎，同时保留一个最重要的长期会员席位。",
  },
  {
    id: "attachment_autonomy",
    dimensions: ["attachment", "autonomy"],
    scientificType: "高边界陪伴型猫咪",
    mainTitle: "很爱你但抱抱要预约的边界战士",
    coreJudgment: "它很在意陪伴，也很在意亲近必须由自己决定。",
    worldAnalysis:
      "它可能主动跟随、睡在你附近、蹭脸或慢眨眼，却在突然被抱起、限制行动或持续触摸时选择离开。它需要的是随时可以靠近你的自由，而不是被固定在你身边。",
    conflictAnalysis:
      "靠近和离开不是感情反复，而是依附需求与自主边界同时存在。越不强迫它证明亲密，它越容易反复主动回来。",
    posterSummary:
      "主动贴贴可以，强行抱抱不行。它爱你的方式里，始终保留一张自由通行证。",
  },
  {
    id: "attachment_stability",
    dimensions: ["attachment", "stability"],
    scientificType: "稳定陪伴型猫咪",
    mainTitle: "不吵不闹但一直都在的长期室友",
    coreJudgment: "它的亲近未必热烈，却很容易成为日复一日的稳定习惯。",
    worldAnalysis:
      "它倾向于通过固定的靠近、共享空间、迎接或跟随维持关系，并且在日常节律中表现得较为可预测。陪伴不是一次性的兴奋，而是一种长期安排。",
    conflictAnalysis:
      "因为它的表达稳定而不夸张，主人有时会低估这份依恋。其实，反复选择同一位置和同一个人，本身就是很明确的偏爱。",
    posterSummary:
      "它不一定每天大声表白，但会准时出现在属于你们的固定位置。",
  },
  {
    id: "sociability_autonomy",
    dimensions: ["sociability", "autonomy"],
    scientificType: "自主社交型猫咪",
    mainTitle: "愿意营业但拒绝随便摸的店长",
    coreJudgment: "它愿意见人，也坚持社交规则必须由自己制定。",
    worldAnalysis:
      "它对访客和新关系可能表现得好奇、友好，甚至主动靠近，但身体接触、互动时长和退出时机仍需要自己掌握。会社交与愿意被控制完全是两件事。",
    conflictAnalysis:
      "它不是一会儿热情一会儿翻脸，而是清楚区分‘我愿意认识你’和‘你可以随便碰我’。读懂边界信号，会让它的社交更稳定。",
    posterSummary:
      "本店欢迎参观，摸猫服务请等待店长本人批准。",
  },
  {
    id: "sociability_stability",
    dimensions: ["sociability", "stability"],
    scientificType: "稳定社交型猫咪",
    mainTitle: "见人不慌的温柔接待员",
    coreJudgment: "它面对关系变化较开放，也不容易因为一次见面打乱全部节奏。",
    worldAnalysis:
      "温和访客出现时，它较容易保持在场、逐步靠近或接受互动。即使初期需要观察，也通常能在环境稳定后恢复正常活动。",
    conflictAnalysis:
      "它的友好来自稳定判断，而不是毫无戒心。保持低压力、不过度围堵，它会更自然地展示社交能力。",
    posterSummary:
      "新客人可以认识，日常作息也不能耽误，营业和生活两不误。",
  },
  {
    id: "autonomy_stability",
    dimensions: ["autonomy", "stability"],
    scientificType: "稳定独立型猫咪",
    mainTitle: "不用操心也别多管的安静店长",
    coreJudgment: "它清楚自己的节奏和边界，也很少需要持续关注来维持安全感。",
    worldAnalysis:
      "它通常能够独自休息、恢复和安排活动，并对自己的位置、互动时间和身体边界有稳定偏好。关系对它重要，但不需要靠持续贴近来证明。",
    conflictAnalysis:
      "它看起来省心，不代表不需要理解。尊重固定习惯和停止信号，会比频繁主动打扰更能维护长期信任。",
    posterSummary:
      "生活可以自己安排，感情也一直在，只是请不要随时检查营业状态。",
  },
];

export const LOW_DIMENSION_NOTES: Record<DimensionId, string> = {
  sensitivity:
    "它在普通变化面前相对松弛，不容易因为细小动静中断生活；这不代表它没有压力，只是外在反应通常不那么明显。",
  exploration:
    "它更偏爱熟悉、可预测的环境。新鲜感并非越多越好，低压力、逐步出现的变化更容易被接受。",
  attachment:
    "它较少通过高频跟随或身体接触确认关系，更可能使用共享空间、固定位置或短暂回应维持连接。",
  sociability:
    "它把社交名额留给少数熟悉对象，不需要通过认识更多人来证明适应良好。",
  autonomy:
    "它对触摸和安排相对随和，但仍应观察尾巴、耳朵和身体紧张等细微信号，避免把耐受误当成持续愿意。",
  stability:
    "它的状态切换较快，兴奋、挫败或惊吓可能需要更清楚的降温过程。短而可预测的互动通常比一次持续很久更合适。",
};

export const RELATIONSHIP_TEMPLATES: Record<string, RelationshipTemplate> = {
  boundary_companion: {
    id: "boundary_companion",
    title: "高边界陪伴型",
    summary:
      "它很重视你的存在，也很重视自己决定靠近的方式。它可能愿意睡在你附近、跟随你移动或主动蹭你，却不喜欢突然被抱起、固定姿势或被延长互动。对它来说，亲近不是持续被触碰，而是拥有随时靠近和离开的自由。",
    quote: "它不是忽近忽远，只是一边爱你，一边确认自己仍然自由。",
    innerMonologue: "我会自己决定什么时候靠近，但你要一直在那里。",
  },
  close_contact: {
    id: "close_contact",
    title: "贴身依附型",
    summary:
      "它倾向于用身体距离表达关系：主动贴近、睡在身边、跟随或在你停下时靠过来。你的气味、体温和位置对它具有明显吸引力。即使如此，也要让每一次接触都保留退出空间，避免把主动贴近理解成随时愿意被抱住。",
    quote: "它把最安心的位置，放在离你很近的地方。",
    innerMonologue: "我只是刚好想睡这里，刚好这里有你。",
  },
  shared_space: {
    id: "shared_space",
    title: "共享空间依恋型",
    summary:
      "它表达亲近的方式更像‘和你待在一起’，而不一定是持续贴在身上。它会选择同一张床、同一个房间或你工作位置附近，在保持舒适距离的同时确认彼此存在。对它来说，共享空间本身就是稳定的陪伴。",
    quote: "它不需要一直贴着你，因为待在同一个空间已经足够亲密。",
    innerMonologue: "我在这里，你也在这里，这样就很好。",
  },
  watchful_companion: {
    id: "watchful_companion",
    title: "守望式陪伴型",
    summary:
      "它更喜欢在床尾、门口、房间边缘或稍远位置参与陪伴。这样的选择通常同时满足了观察动线、保留退路和靠近熟悉对象的需要。它的距离感不一定意味着疏远，而可能是最符合它安全策略的亲近方式。",
    quote: "它把陪伴放在看得见你、也看得见出口的位置。",
    innerMonologue: "我负责看门，你负责安心睡觉。",
  },
  selective_trust: {
    id: "selective_trust",
    title: "选择性信任型",
    summary:
      "它不会把同样的亲近平均分给所有人。面对陌生人可能慢热、观察或保持距离，但对熟悉照顾者会出现慢眨眼、蹭脸、共享空间或重逢后的靠近。它的信任范围不大，却通常很稳定。",
    quote: "它不是不亲人，只是把全部社交额度留给了少数重要对象。",
    innerMonologue: "我不需要认识所有人，有你通过审核就够了。",
  },
  independent_secure: {
    id: "independent_secure",
    title: "独立式安全连接型",
    summary:
      "它较少用跟随、迎接或频繁身体接触确认关系，更习惯独自休息、按照固定节奏出现。只要它会在熟悉空间放松、接受互动并在需要时重新靠近，这种独立并不等于关系薄弱。它只是无需持续确认你是否仍然属于这个家。",
    quote: "它不必时刻黏着你，因为你早已被放进它稳定的生活背景里。",
    innerMonologue: "不用一直叫我，我知道你在。",
  },
  social_warm: {
    id: "social_warm",
    title: "开放亲和型",
    summary:
      "它对熟悉照顾者有明显连接，也较愿意认识其他人。迎接、竖尾靠近、闻嗅和共享空间都可能成为它的社交方式。友好并不意味着没有界限，越能尊重它结束互动的信号，它越愿意持续营业。",
    quote: "它愿意把温柔分给很多人，但仍会把最熟悉的位置留给你。",
    innerMonologue: "欢迎光临，熟客可以坐近一点。",
  },
  flexible_companion: {
    id: "flexible_companion",
    title: "弹性陪伴型",
    summary:
      "它没有固定使用单一方式表达关系。有时主动靠近，有时独自休息；有时跟随，有时只在远处观察。它更看重当下情境是否舒适，而不是每天重复同一种亲密仪式。",
    quote: "它会用不同距离陪着你，但关系一直在同一条轨道上。",
    innerMonologue: "今天坐近一点，明天远一点，都是我自己的位置。",
  },
};

export const BADGE_RULES: BadgeRule[] = [
  { questionId: 49, answer: "A", id: "sleep_pillow", label: "枕边值夜员", category: "sleep", priority: 100 },
  { questionId: 49, answer: "B", id: "sleep_foot", label: "床尾护卫", category: "sleep", priority: 100 },
  { questionId: 49, answer: "C", id: "sleep_distance", label: "一爪距离陪伴专家", category: "sleep", priority: 100 },
  { questionId: 49, answer: "D", id: "sleep_same_room", label: "同房守夜员", category: "sleep", priority: 100 },
  { questionId: 49, answer: "E", id: "sleep_independent", label: "独立卧室住户", category: "sleep", priority: 100 },

  { questionId: 51, answer: "A", id: "scent_collector", label: "气味收藏家", category: "trust", priority: 92 },
  { questionId: 51, answer: "B", id: "scent_regular", label: "熟悉气味会员", category: "trust", priority: 72 },
  { questionId: 52, answer: "A", id: "welcome_home", label: "回家欢迎部长", category: "trust", priority: 88 },
  { questionId: 52, answer: "B", id: "reunion_observer", label: "重逢观察员", category: "trust", priority: 65 },
  { questionId: 53, answer: "A", id: "room_follower", label: "贴身随行护送员", category: "trust", priority: 90 },
  { questionId: 53, answer: "B", id: "checkpoint_guard", label: "关键路口等候员", category: "trust", priority: 78 },
  { questionId: 54, answer: "A", id: "slow_blink", label: "慢眨眼认证官", category: "trust", priority: 96 },
  { questionId: 54, answer: "B", id: "slow_blink_occasional", label: "偶尔签发信任证", category: "trust", priority: 66 },
  { questionId: 55, answer: "A", id: "cheek_rub", label: "蹭脸盖章员", category: "trust", priority: 94 },
  { questionId: 55, answer: "B", id: "body_rub", label: "身体贴贴联络员", category: "trust", priority: 76 },
  { questionId: 56, answer: "A", id: "tail_greeting", label: "竖尾问候员", category: "trust", priority: 84 },
  { questionId: 57, answer: "A", id: "desk_close", label: "桌边贴贴住户", category: "trust", priority: 74 },
  { questionId: 57, answer: "B", id: "quiet_companion", label: "静默陪伴员", category: "trust", priority: 86 },
  { questionId: 57, answer: "E", id: "keyboard_takeover", label: "键盘占领专家", category: "trust", priority: 98 },
  { questionId: 58, answer: "A", id: "quiet_caregiver", label: "安静陪护员", category: "trust", priority: 82 },
  { questionId: 58, answer: "B", id: "emotion_observer", label: "情绪观察员", category: "trust", priority: 70 },
  { questionId: 59, answer: "A", id: "human_safe_base", label: "把你当安全基地", category: "trust", priority: 91 },
  { questionId: 59, answer: "B", id: "fixed_safe_spot", label: "固定安全点管理员", category: "trust", priority: 68 },
  { questionId: 60, answer: "A", id: "name_responder", label: "叫名字就到岗", category: "trust", priority: 80 },
  { questionId: 60, answer: "B", id: "delayed_responder", label: "稍后到场回应员", category: "trust", priority: 64 },
  { questionId: 60, answer: "E", id: "benefit_responder", label: "利益相关回应专家", category: "trust", priority: 87 },

  { questionId: 61, answer: "A", id: "snack_easygoing", label: "零食请求随缘派", category: "strategy", priority: 48 },
  { questionId: 61, answer: "B", id: "snack_waiter", label: "零食耐心守候员", category: "strategy", priority: 62 },
  { questionId: 61, answer: "C", id: "snack_negotiator", label: "零食谈判大师", category: "strategy", priority: 88 },
  { questionId: 61, answer: "D", id: "empty_bowl_complaint", label: "空碗投诉专员", category: "strategy", priority: 96 },
  { questionId: 61, answer: "E", id: "timing_strategist", label: "时机管理大师", category: "strategy", priority: 93 },
  { questionId: 62, answer: "A", id: "door_easygoing", label: "门禁随缘住户", category: "strategy", priority: 44 },
  { questionId: 62, answer: "B", id: "door_waiter", label: "门口守候员", category: "strategy", priority: 65 },
  { questionId: 62, answer: "C", id: "door_appeal", label: "门禁申诉专员", category: "strategy", priority: 78 },
  { questionId: 62, answer: "D", id: "door_hacker", label: "门禁破解研究员", category: "strategy", priority: 92 },
  { questionId: 62, answer: "E", id: "human_dispatcher", label: "人类调度指挥官", category: "strategy", priority: 99 },
  { questionId: 63, answer: "A", id: "self_entertainment", label: "自主娱乐专家", category: "strategy", priority: 58 },
  { questionId: 63, answer: "B", id: "silent_attention", label: "静默陪伴员", category: "strategy", priority: 67 },
  { questionId: 63, answer: "C", id: "direct_attention", label: "正面索取派", category: "strategy", priority: 74 },
  { questionId: 63, answer: "D", id: "screen_blocker", label: "屏幕遮挡战士", category: "strategy", priority: 97 },
  { questionId: 63, answer: "E", id: "rule_pressure", label: "规则施压研究员", category: "strategy", priority: 95 },
  { questionId: 64, answer: "A", id: "guilty_retreat", label: "心虚撤退员", category: "strategy", priority: 66 },
  { questionId: 64, answer: "B", id: "risk_assessor", label: "风险评估员", category: "strategy", priority: 79 },
  { questionId: 64, answer: "C", id: "innocent_actor", label: "无辜伪装师", category: "strategy", priority: 91 },
  { questionId: 64, answer: "D", id: "attention_redirector", label: "注意力转移师", category: "strategy", priority: 90 },
  { questionId: 64, answer: "E", id: "rule_ignorer", label: "规则无视派", category: "strategy", priority: 85 },
  { questionId: 65, answer: "A", id: "independent_stay", label: "独立留守员", category: "strategy", priority: 54 },
  { questionId: 65, answer: "B", id: "departure_observer", label: "行程观察员", category: "strategy", priority: 68 },
  { questionId: 65, answer: "C", id: "door_goodbye", label: "门口送行员", category: "strategy", priority: 78 },
  { questionId: 65, answer: "D", id: "luggage_blocker", label: "行李拦截员", category: "strategy", priority: 93 },
  { questionId: 65, answer: "E", id: "last_minute_cuddler", label: "最后时刻挽留员", category: "strategy", priority: 95 },
  { questionId: 66, answer: "A", id: "one_off_behavior", label: "偶然行为派", category: "strategy", priority: 42 },
  { questionId: 66, answer: "B", id: "limited_repeater", label: "有限复读员", category: "strategy", priority: 56 },
  { questionId: 66, answer: "C", id: "purpose_communicator", label: "目的沟通专家", category: "strategy", priority: 84 },
  { questionId: 66, answer: "D", id: "ritual_designer", label: "固定仪式设计师", category: "strategy", priority: 94 },
  { questionId: 66, answer: "E", id: "human_researcher", label: "人类反应实验员", category: "strategy", priority: 100 },
];

export const EVIDENCE_RULES: EvidenceRule[] = [
  {
    questionId: 1,
    high: { behavior: "门外脚步或轻微声响出现时，会立刻停下来判断来源", interpretation: "它对听觉变化反应迅速，习惯先确认环境是否仍然安全。", priority: 78 },
    low: { behavior: "普通门外声响很少打断它正在做的事", interpretation: "它对日常声音的耐受较高，通常不会轻易进入警戒状态。", priority: 48 },
  },
  {
    questionId: 2,
    high: { behavior: "陌生人刚进门时，会先拉开距离观察", interpretation: "它建立新关系前需要先完成风险判断，而不是立即进入互动。", priority: 88 },
    low: { behavior: "陌生人出现时较少主动拉开距离", interpretation: "它面对新来访者相对开放，较容易留在现场继续观察或接触。", priority: 58 },
  },
  {
    questionId: 3,
    high: { behavior: "新气味、新家具或新纸箱出现时，会反复闻嗅检查", interpretation: "它会通过气味和重复调查重新建立对环境的掌控感。", priority: 82 },
    low: { behavior: "环境里出现新物品时，很少长时间检查", interpretation: "它对普通物品变化相对松弛，不需要反复确认才能继续活动。", priority: 48 },
  },
  {
    questionId: 4,
    high: { behavior: "家具位置或日常动线有细小变化时，很快就能发现", interpretation: "它对空间布局和日常秩序有较清晰的记忆。", priority: 74 },
    low: { behavior: "家具或动线发生小变化时，通常不会明显关注", interpretation: "它对细小空间变化的反应较低，更容易继续原有活动。", priority: 44 },
  },
  {
    questionId: 5,
    high: { behavior: "常选择既能看清动线、又能保留退路的位置", interpretation: "它会主动兼顾观察视野与退出路线，这是它建立安全感的空间策略。", priority: 94 },
    low: { behavior: "休息时不太在意是否能看见动线或保留退路", interpretation: "它在熟悉环境里较少持续安排警戒位置，空间选择更随意。", priority: 50 },
  },
  {
    questionId: 6,
    high: { behavior: "周围出现意外动作时，容易中断休息、进食或舔毛", interpretation: "它的警戒阈值较低，外部动作容易迅速进入注意范围。", priority: 84 },
    low: { behavior: "周围有人意外动作时，仍能继续休息或进食", interpretation: "它对熟悉环境中的动作干扰耐受较高。", priority: 52 },
  },
  {
    questionId: 7,
    high: { behavior: "熟悉的人在旁走动和说话时，仍能在开阔位置放松", interpretation: "它已把熟悉成员的日常活动纳入安全背景，通常不需要持续警戒。", priority: 86 },
    low: { behavior: "熟悉的人走动也容易让它中断休息或进食", interpretation: "即使在熟悉环境中，它仍会持续追踪周围变化。", priority: 76 },
  },
  {
    questionId: 8,
    high: { behavior: "进入陌生空间后，很快就能开始探索、进食或休息", interpretation: "它对陌生环境的初步适应较快，能够较早恢复日常行为。", priority: 88 },
    low: { behavior: "进入陌生空间后，需要较长时间才恢复进食、探索或休息", interpretation: "它适应新空间时需要更完整的观察和安全确认过程。", priority: 82 },
  },
  {
    questionId: 9,
    high: { behavior: "新纸箱、新袋子或新玩具出现时，会主动靠近调查", interpretation: "新奇事物容易激活它的探索动机。", priority: 88 },
    low: { behavior: "新物品出现时，通常不会主动靠近研究", interpretation: "它更偏爱熟悉、可预测的对象，不急于参与新鲜变化。", priority: 62 },
  },
  {
    questionId: 10,
    high: { behavior: "房门或新的可进入区域打开时，总想进去看看", interpretation: "它对新空间和临时机会十分敏感，愿意主动扩展活动范围。", priority: 80 },
    low: { behavior: "新的房间或柜门打开时，很少主动进入", interpretation: "它对扩大活动范围的需求较低，更重视熟悉区域。", priority: 52 },
  },
  {
    questionId: 11,
    high: { behavior: "没人逗它时，也会自己发起奔跑、攀爬或捕猎游戏", interpretation: "它具备明显的自主活动和玩耍驱动力。", priority: 82 },
    low: { behavior: "没有人陪玩时，很少主动发起高强度活动", interpretation: "它的活动更依赖情境或互动邀请，独自玩耍驱动相对温和。", priority: 48 },
  },
  {
    questionId: 12,
    high: { behavior: "喜欢在窗边、高处、角落和新位置观察环境", interpretation: "它会主动利用不同视角收集信息，探索不只表现为奔跑。", priority: 78 },
    low: { behavior: "很少更换观察位置或主动寻找新视角", interpretation: "它更倾向于使用熟悉的固定点位。", priority: 46 },
  },
  {
    questionId: 13,
    high: { behavior: "面对藏起来的零食或暂时拿不到的玩具，会尝试不同方法", interpretation: "它具备较强的问题解决动机，不会只等待主人直接提供答案。", priority: 94 },
    low: { behavior: "遇到需要动脑或改变方法的目标时，较少持续尝试", interpretation: "它更偏爱直接、熟悉的获取方式，复杂任务可能降低兴趣。", priority: 60 },
  },
  {
    questionId: 14,
    high: { behavior: "第一次没有成功时，还会继续尝试一段时间", interpretation: "它对目标有较强坚持性，失败不会立即终止探索。", priority: 90 },
    low: { behavior: "第一次没有成功时，通常很快离开", interpretation: "它更重视即时反馈，重复失败会迅速降低参与意愿。", priority: 64 },
  },
  {
    questionId: 15,
    high: { behavior: "新玩具通常只能吸引它很短时间", interpretation: "它对单一刺激的兴趣维持较短，可能需要更频繁的玩法变化。", priority: 72 },
    low: { behavior: "新玩具出现后，通常会持续研究或反复回去查看", interpretation: "它对新目标的兴趣维持较久，愿意进行重复探索。", priority: 78 },
  },
  {
    questionId: 16,
    high: { behavior: "更愿意维持完全不变的日常，很少调查新东西", interpretation: "它明显偏好熟悉和可预测的生活结构。", priority: 82 },
    low: { behavior: "即使日常稳定，也会主动调查环境中新出现的东西", interpretation: "它愿意在稳定生活中持续加入小规模新鲜感。", priority: 68 },
  },
  {
    questionId: 17,
    high: { behavior: "不为食物或开门，也会主动来到主人附近", interpretation: "它的靠近具有关系动机，而不只与资源获取有关。", priority: 96 },
    low: { behavior: "没有明确需求时，较少主动靠近主人", interpretation: "它更习惯用独立停留或低频互动维持关系。", priority: 64 },
  },
  {
    questionId: 18,
    high: { behavior: "主人坐下或躺下后，它常在同一空间附近休息", interpretation: "共享空间是它重要的陪伴方式，不一定需要持续身体接触。", priority: 94 },
    low: { behavior: "主人停留时，它通常仍选择其他空间休息", interpretation: "它的休息选择更独立，不依赖与主人保持近距离。", priority: 62 },
  },
  {
    questionId: 19,
    high: { behavior: "主人回家后，会主动迎接、靠近或跟随", interpretation: "重逢会触发它重新确认关系和位置。", priority: 90 },
    low: { behavior: "主人回家后，很少立即靠近或迎接", interpretation: "它更按自己的节奏处理重逢，不把即时迎接作为主要关系表达。", priority: 70 },
  },
  {
    questionId: 20,
    high: { behavior: "主人换房间时，它经常跟随或稍后出现", interpretation: "它会持续确认主要照顾者的位置，把人的移动纳入自己的活动安排。", priority: 88 },
    low: { behavior: "主人换房间时，它通常继续留在原处", interpretation: "它不需要通过高频跟随确认关系，空间独立性较高。", priority: 62 },
  },
  {
    questionId: 21,
    high: { behavior: "会主动用额头、脸颊、身体或尾巴蹭主人", interpretation: "它会通过亲和接触和气味交换主动标记熟悉关系。", priority: 98 },
    low: { behavior: "很少主动用身体蹭主人", interpretation: "身体摩擦不是它主要的关系表达方式，需结合其他低强度信号判断亲近。", priority: 66 },
  },
  {
    questionId: 22,
    high: { behavior: "安静互动时，会慢眨眼或柔和回望", interpretation: "它会使用低强度、放松的视觉信号回应熟悉对象。", priority: 100 },
    low: { behavior: "很少出现慢眨眼或柔和回望", interpretation: "视觉回应可能不是它最明显的信任信号，不能据此单独判断关系。", priority: 58 },
  },
  {
    questionId: 23,
    high: { behavior: "即使主人安静在家，它也大部分时间选择远离", interpretation: "它对共享空间的需求较低，更习惯独立安排休息区域。", priority: 76 },
    low: { behavior: "主人安静在家时，它通常不会长期远离", interpretation: "即便不持续互动，它也倾向于把主人纳入附近的生活空间。", priority: 78 },
  },
  {
    questionId: 24,
    high: { behavior: "除非涉及食物或开门，很少主动发起接触", interpretation: "它的互动发起较少，关系表达可能更多藏在停留、接受和固定习惯中。", priority: 80 },
    low: { behavior: "即使没有资源需求，也会主动发起接触", interpretation: "它会主动维护关系，而不只在需要帮助时才靠近。", priority: 88 },
  },
  {
    questionId: 25,
    high: { behavior: "陌生人安静坐下后，它会逐渐靠近观察或闻嗅", interpretation: "在低压力条件下，它愿意把观察推进到主动接触。", priority: 88 },
    low: { behavior: "陌生人即使安静停留，它也很少主动靠近", interpretation: "它建立新关系需要更长时间，或更偏好保持明确距离。", priority: 76 },
  },
  {
    questionId: 26,
    high: { behavior: "家中来客一段时间后，它能够留在同一空间", interpretation: "它可以在安全条件下逐渐适应访客的存在。", priority: 84 },
    low: { behavior: "访客在家时，它通常始终选择躲藏或远离", interpretation: "陌生人的持续存在会明显改变它的空间选择。", priority: 78 },
  },
  {
    questionId: 27,
    high: { behavior: "除了主要照顾者，也愿意和其他家庭成员互动", interpretation: "它的熟悉关系范围较广，社交并不只集中在单一对象。", priority: 76 },
    low: { behavior: "亲近主要集中在少数照顾者身上", interpretation: "它对关系对象具有明显筛选，更偏向少数深度连接。", priority: 72 },
  },
  {
    questionId: 28,
    high: { behavior: "由不太熟悉的人喂食、陪玩时，能逐渐接受对方", interpretation: "温和的正向互动能够帮助它建立新的熟悉关系。", priority: 78 },
    low: { behavior: "不太熟悉的人即使喂食或陪玩，也很难让它放松", interpretation: "它不会因为资源快速放下戒心，关系建立更依赖时间。", priority: 72 },
  },
  {
    questionId: 29,
    high: { behavior: "同一个访客多次出现后，它会比第一次更快放松", interpretation: "它能通过重复、可预测的经历更新对人的判断。", priority: 82 },
    low: { behavior: "重复来访并不会明显缩短它的观察时间", interpretation: "它对新关系的熟悉化速度较慢，需要更稳定的互动条件。", priority: 68 },
  },
  {
    questionId: 30,
    high: { behavior: "面对温和呼唤或伸手，会主动闻嗅或竖尾靠近", interpretation: "它较愿意回应低压力的社交邀请。", priority: 86 },
    low: { behavior: "面对温和的社交邀请，也很少主动接近", interpretation: "它更倾向于由自己选择时机，而不是立即回应人的邀请。", priority: 70 },
  },
  {
    questionId: 31,
    high: { behavior: "家里有陌生人时，从开始到结束都保持躲藏或警戒", interpretation: "访客会持续占用它的安全评估资源，短时间内很难恢复日常状态。", priority: 88 },
    low: { behavior: "有陌生人在场时，它通常不会全程躲藏", interpretation: "即使起初谨慎，它也能在一段时间后恢复在场活动。", priority: 74 },
  },
  {
    questionId: 32,
    high: { behavior: "对方多次温和来访后，它仍很难放松或靠近", interpretation: "它的社交筛选较严格，重复见面不一定自动转化为信任。", priority: 84 },
    low: { behavior: "温和访客重复出现后，它通常会逐渐放松", interpretation: "它能通过熟悉化过程扩展关系范围。", priority: 72 },
  },
  {
    questionId: 33,
    high: { behavior: "更喜欢自己决定什么时候开始和结束互动", interpretation: "选择权是它保持舒适和主动亲近的重要条件。", priority: 96 },
    low: { behavior: "对互动由谁发起、何时结束相对随和", interpretation: "它对人的互动安排接受度较高，但仍需观察细微信号。", priority: 58 },
  },
  {
    questionId: 34,
    high: { behavior: "不想继续被摸时，会先用尾巴、耳朵或离开表达", interpretation: "它具备较清晰的边界沟通方式，主人可以在升级前读到信号。", priority: 100 },
    low: { behavior: "互动停止信号不明显，反应可能出现得较突然", interpretation: "需要更细致地观察身体紧张和刺激累积，避免等到强烈反应才停止。", priority: 88 },
  },
  {
    questionId: 35,
    high: { behavior: "被突然抱起或限制行动时，会明确表示不愿意", interpretation: "它重视身体选择权；拒绝被控制不等于拒绝关系。", priority: 100 },
    low: { behavior: "被熟悉的人抱起或调整姿势时，通常较能接受", interpretation: "它对身体接触较随和，但耐受仍不等于任何时候都愿意。", priority: 64 },
  },
  {
    questionId: 36,
    high: { behavior: "需要固定独处时间和不会被打扰的位置", interpretation: "私人空间是它恢复状态、维持安全感的重要资源。", priority: 90 },
    low: { behavior: "很少主动寻找长期不被打扰的独立空间", interpretation: "它对共享环境和持续有人活动的耐受较高。", priority: 52 },
  },
  {
    questionId: 37,
    high: { behavior: "对睡觉点、抓挠处或个人物品有稳定偏好", interpretation: "固定资源和空间秩序对它具有明显意义。", priority: 84 },
    low: { behavior: "对休息点和常用物品的选择较灵活", interpretation: "它对资源位置变化的适应相对轻松。", priority: 48 },
  },
  {
    questionId: 38,
    high: { behavior: "比起被人直接抱住，更愿意自己走近接触", interpretation: "自主发起能显著提高它对亲近的接受度。", priority: 98 },
    low: { behavior: "主动靠近与被熟悉的人抱近，对它差异不大", interpretation: "它对亲近方式较随和，但仍应保留停止和退出选项。", priority: 56 },
  },
  {
    questionId: 39,
    high: { behavior: "熟悉的人随时抱起或中断它时，它通常也不太介意", interpretation: "它对熟人身体接触和安排的耐受较高。", priority: 70 },
    low: { behavior: "即使面对熟悉的人，也不喜欢随时被抱起或打断", interpretation: "熟悉关系不会取消它的身体边界，互动仍需获得当下同意。", priority: 86 },
  },
  {
    questionId: 40,
    high: { behavior: "休息点或常用物品被移动后，通常很快接受", interpretation: "它对资源位置的变化适应较灵活。", priority: 66 },
    low: { behavior: "常用位置或物品移动后，会明显关注或需要重新适应", interpretation: "固定空间秩序是它维持安全感的重要部分。", priority: 82 },
  },
  {
    questionId: 41,
    high: { behavior: "在相似情境中的反应比较一致，主人容易预测", interpretation: "它的行为节奏相对稳定，情境与反应之间有清晰规律。", priority: 88 },
    low: { behavior: "相似情境中也可能出现差异很大的反应", interpretation: "它的状态更容易受到当天刺激、精力或环境细节影响。", priority: 72 },
  },
  {
    questionId: 42,
    high: { behavior: "吃饭、开门或关注稍微延迟时，通常能先等待", interpretation: "它对短暂挫败具有一定耐受，不必立即升级行为。", priority: 90 },
    low: { behavior: "需求稍微延迟时，很快就会加强叫声或行动", interpretation: "它对等待较敏感，清晰、可预测的日程会降低升级行为。", priority: 80 },
  },
  {
    questionId: 43,
    high: { behavior: "激烈玩耍或兴奋之后，能较快重新安静下来", interpretation: "它在高唤醒状态后拥有较好的自我恢复能力。", priority: 88 },
    low: { behavior: "兴奋后需要较长时间才能重新安静", interpretation: "它的状态降温速度较慢，互动结束需要预留缓冲过程。", priority: 76 },
  },
  {
    questionId: 44,
    high: { behavior: "剪指甲或喂药结束后，能较快恢复正常互动", interpretation: "单次不愉快经历通常不会长时间改变它对熟悉关系的反应。", priority: 92 },
    low: { behavior: "护理结束后，会较久保持距离或警惕", interpretation: "不愉快事件对它的影响持续较久，需要更温和的恢复空间。", priority: 82 },
  },
  {
    questionId: 45,
    high: { behavior: "受到惊吓后，环境安静下来便能逐渐恢复日常行为", interpretation: "它能够从警戒状态重新回到休息、进食或探索。", priority: 94 },
    low: { behavior: "受到惊吓后，即使环境恢复安静也很久无法放松", interpretation: "刺激会较长时间影响它的状态，需要更稳定的安全点和降压过程。", priority: 88 },
  },
  {
    questionId: 46,
    high: { behavior: "每天活动、休息、进食和互动节奏总体稳定", interpretation: "可预测的日常节律是它行为稳定的重要基础。", priority: 82 },
    low: { behavior: "每天的活动和互动节奏变化较大", interpretation: "它的日常更容易随精力和环境变化而切换。", priority: 68 },
  },
  {
    questionId: 47,
    high: { behavior: "有时会在没有明显原因时突然兴奋或烦躁", interpretation: "它的状态切换速度较快，主人可能需要提前识别刺激累积。", priority: 90 },
    low: { behavior: "很少在没有明显原因时突然进入强烈状态", interpretation: "它的情绪与行为转换通常较有迹可循。", priority: 74 },
  },
  {
    questionId: 48,
    high: { behavior: "需求没有立刻满足时，容易迅速升级叫喊、抓挠或推物品", interpretation: "它对挫败反应较快，固定流程和提前回应能减少行为升级。", priority: 96 },
    low: { behavior: "需求没有立刻满足时，通常不会迅速升级行为", interpretation: "它对短暂等待具有较好的耐受。", priority: 72 },
  },
];

export const RELATIONSHIP_EVIDENCE: Record<
  number,
  Partial<Record<"A" | "B" | "C" | "D" | "E", Omit<import("./cat-report-model").BehaviorEvidence, "sourceQuestionId">>>
> = {
  49: {
    A: { behavior: "夜里常睡在头部或枕边", interpretation: "它倾向于选择较近的睡眠距离，但仍需结合姿态、温度和长期习惯理解。", priority: 100 },
    B: { behavior: "夜里常睡在脚边或床尾", interpretation: "它希望参与陪伴，同时保留观察动线、舒适距离和自由离开的空间。", priority: 100 },
    C: { behavior: "会同床休息，但通常保持一些距离", interpretation: "共享睡眠空间对它有吸引力，而保留距离也是舒适边界的一部分。", priority: 98 },
    D: { behavior: "会留在同一房间休息，但通常不上床", interpretation: "它更偏好守望式陪伴：确认彼此存在，同时维持自己的休息位置。", priority: 96 },
    E: { behavior: "通常在其他房间或固定窝里睡", interpretation: "它的睡眠选择更独立，不能仅凭分房休息判断关系亲疏。", priority: 90 },
  },
  50: {
    A: { behavior: "睡在附近时会紧贴或把身体靠在主人身上", interpretation: "身体接触是它较明显的放松与亲近方式。", priority: 92 },
    B: { behavior: "靠得较近并把身体朝向主人", interpretation: "它愿意维持近距离关注，同时不一定需要持续贴靠。", priority: 78 },
    C: { behavior: "常背对主人但距离很近，身体状态放松", interpretation: "背对并不一定是忽视；在近距离放松休息本身就是信任线索。", priority: 94 },
    D: { behavior: "休息时保持距离，同时面向房门或动线", interpretation: "它会把陪伴和环境观察放在同一个位置安排中。", priority: 90 },
    E: { behavior: "很少在主人附近睡", interpretation: "睡眠距离不是它主要的关系表达方式，需要结合日间互动判断。", priority: 72 },
  },
  51: {
    A: { behavior: "经常主动睡在主人穿过的衣物、被子或枕头上", interpretation: "熟悉气味可能为它提供稳定感，也让这些物品成为偏好的休息资源。", priority: 96 },
    B: { behavior: "比较常选择带有主人气味的物品休息", interpretation: "它对熟悉气味有明显偏好，但不能单独等同于依恋强弱。", priority: 80 },
    C: { behavior: "偶尔会选择主人常用的物品休息", interpretation: "气味熟悉可能是它选择位置时的一个因素。", priority: 60 },
    D: { behavior: "很少选择带有主人气味的物品", interpretation: "它可能更看重材质、温度或位置，而不是气味线索。", priority: 50 },
    E: { behavior: "几乎没有观察到它睡在主人常用物品上", interpretation: "缺少这一行为不能推断关系较弱。", priority: 44 },
  },
  52: {
    A: { behavior: "主人回家时会主动到门口或很快前来迎接", interpretation: "重逢会明显触发它的关系确认行为。", priority: 92 },
    B: { behavior: "主人回家时先观察，随后主动靠近", interpretation: "它会先确认当下状态，再用自己的节奏完成重逢。", priority: 86 },
    C: { behavior: "主人回家时留在原位，但会持续关注行动", interpretation: "它在意重逢，却不一定通过立即靠近表达。", priority: 84 },
    D: { behavior: "主人回家时反应不明显，继续原有活动", interpretation: "不立即迎接不等于没有关系，它可能已把回家视为稳定日常。", priority: 82 },
    E: { behavior: "主人回家时常先躲开，较久后才出现", interpretation: "重逢本身可能带来声音或动作刺激，它需要先恢复安全感。", priority: 78 },
  },
  53: {
    A: { behavior: "主人换房间时经常立即跟随", interpretation: "它会通过位置跟随持续确认陪伴关系。", priority: 90 },
    B: { behavior: "主人换房间后，它会稍后出现或在关键位置等待", interpretation: "它更像定点守望者，不需要每一步紧跟，也会维持位置关联。", priority: 88 },
    C: { behavior: "只在吃饭、睡觉等特定时段跟随", interpretation: "它的跟随与固定生活仪式相关，而不是全天持续。", priority: 66 },
    D: { behavior: "偶尔跟随主人移动", interpretation: "它会根据当下状态选择是否参与移动。", priority: 56 },
    E: { behavior: "基本不会跟随主人换房间", interpretation: "它不依赖高频位置确认维持关系，更偏独立活动。", priority: 72 },
  },
  54: {
    A: { behavior: "经常主动慢眨眼，回应后仍保持放松", interpretation: "慢眨眼是它较稳定的低强度积极互动信号。", priority: 100 },
    B: { behavior: "偶尔会对主人慢眨眼或柔和回望", interpretation: "它会在部分放松情境中使用视觉信号回应关系。", priority: 78 },
    C: { behavior: "很少观察到慢眨眼", interpretation: "慢眨眼可能不是它主要的互动方式，应结合其他信号。", priority: 54 },
    D: { behavior: "几乎没有观察到慢眨眼", interpretation: "缺少这一单一信号不能判断信任不足。", priority: 48 },
    E: { behavior: "主人还没有特别留意慢眨眼行为", interpretation: "这项关系线索目前信息不足。", priority: 36 },
  },
  55: {
    A: { behavior: "与资源无关时也经常主动蹭主人", interpretation: "它会用身体接触和气味交换主动维护熟悉关系。", priority: 98 },
    B: { behavior: "比较常主动用头、脸颊或身体蹭主人", interpretation: "身体摩擦是它常见的亲和接触方式。", priority: 82 },
    C: { behavior: "主要在吃饭、开门或索取互动时蹭主人", interpretation: "这一行为同时承担亲和接触和需求沟通功能。", priority: 76 },
    D: { behavior: "很少主动蹭主人", interpretation: "它可能使用共享空间、视觉回应或接受触摸等其他方式表达关系。", priority: 62 },
    E: { behavior: "几乎不会主动蹭主人", interpretation: "身体摩擦并非所有猫都会频繁使用，不能单独判断关系。", priority: 58 },
  },
  56: {
    A: { behavior: "向主人走来时经常竖尾，尾端放松", interpretation: "这是较常见的积极问候姿态之一，说明当下接近状态较放松。", priority: 90 },
    B: { behavior: "走近主人时尾巴多数自然放松", interpretation: "它靠近时整体状态较平稳。", priority: 68 },
    C: { behavior: "靠近时尾巴状态不固定", interpretation: "它的问候姿态会随情境变化，需要结合身体和耳朵判断。", priority: 50 },
    D: { behavior: "靠近时常低尾或身体压低", interpretation: "它在部分接近情境中仍保持谨慎，需要降低动作和接触压力。", priority: 80 },
    E: { behavior: "主人尚未留意靠近时的尾巴状态", interpretation: "这一问候线索目前信息不足。", priority: 36 },
  },
  57: {
    A: { behavior: "主人工作时，它会主动贴近或趴在桌边", interpretation: "它倾向于用近距离共享活动时间表达陪伴。", priority: 88 },
    B: { behavior: "主人工作时，它会在旁边固定位置安静陪伴", interpretation: "静默共享空间是它稳定而低打扰的亲近方式。", priority: 96 },
    C: { behavior: "主人工作时，它偶尔出现、确认后再离开", interpretation: "它会进行低频关系确认，不需要持续停留。", priority: 72 },
    D: { behavior: "主人工作时，它通常在其他地方活动", interpretation: "它能独立安排活动，不依赖持续共享工作空间。", priority: 58 },
    E: { behavior: "主人工作时，它会挡屏幕、踩键盘争取注意", interpretation: "它已经学会用高成功率的方式直接中断人类注意力。", priority: 100 },
  },
  58: {
    A: { behavior: "主人安静或身体不舒服时，它会比平时更靠近", interpretation: "它会对人的活动状态变化作出接近反应，但不宜解释为准确识别复杂情绪。", priority: 84 },
    B: { behavior: "主人安静时，它会在附近观察", interpretation: "它会关注状态变化，同时保持自己的互动距离。", priority: 74 },
    C: { behavior: "主人状态变化时，它的行为和平时差不多", interpretation: "它更依赖固定日常，而不是明显改变互动。", priority: 52 },
    D: { behavior: "主人安静或不舒服时，它会减少接近", interpretation: "人的状态变化可能让环境变得不熟悉，它会先拉开距离观察。", priority: 70 },
    E: { behavior: "尚未观察到主人状态变化时它的反应", interpretation: "这一关系线索目前信息不足。", priority: 36 },
  },
  59: {
    A: { behavior: "受到轻微惊吓后，会先靠近主人或停留在附近", interpretation: "在部分受惊情境中，熟悉照顾者可能成为它的安全线索之一。", priority: 94 },
    B: { behavior: "受到惊吓后，会回到自己的固定安全点", interpretation: "它主要依靠熟悉空间和固定资源完成自我恢复。", priority: 86 },
    C: { behavior: "受到惊吓后，会躲到家具下或隐蔽处", interpretation: "隐蔽和降低暴露是它常用的安全恢复策略。", priority: 82 },
    D: { behavior: "受到惊吓后，会留在原地观察并自行恢复", interpretation: "它更倾向于持续评估环境，而不是立刻转移位置。", priority: 76 },
    E: { behavior: "受惊后没有固定去向", interpretation: "它的恢复方式会随刺激类型和所在位置变化。", priority: 52 },
  },
  60: {
    A: { behavior: "呼唤名字时，它通常很快走过来", interpretation: "它较愿意直接回应人的声音并进入互动。", priority: 84 },
    B: { behavior: "呼唤时会看向主人或回应，之后再靠近", interpretation: "它听到了邀请，但会按自己的节奏决定行动时机。", priority: 88 },
    C: { behavior: "呼唤时会注意主人，但不一定走过来", interpretation: "注意和服从不是同一件事；它可能完成回应，却选择留在原处。", priority: 92 },
    D: { behavior: "呼唤名字时通常没有明显反应", interpretation: "名字回应不是判断关系的可靠单一指标，也会受到动机和环境影响。", priority: 70 },
    E: { behavior: "主要在食物、开门或玩具相关时回应呼唤", interpretation: "它会把人的呼唤与具体收益联系起来，回应具有明显情境性。", priority: 86 },
  },
};

export const MISUNDERSTANDING_COPY = {
  closenessAndAutonomy: {
    id: "closeness_and_autonomy",
    ownerMayThink: "它有时主动靠近，有时又突然离开，是不是对我忽冷忽热？",
    betterExplanation:
      "更接近的解释是，它同时需要陪伴和选择权。能够自己离开、又反复回来，通常说明它相信这段关系不会因为短暂距离而消失。",
  },
  dislikeHolding: {
    id: "dislike_holding",
    ownerMayThink: "它不喜欢被抱，是不是不够信任我？",
    betterExplanation:
      "不喜欢被抱更常与身体控制感和退出权有关。它可能愿意睡在你身边、蹭你或慢眨眼，却仍不接受被突然限制行动；这些行为并不矛盾。",
  },
  bedFoot: {
    id: "bed_foot",
    ownerMayThink: "它只睡床尾或脚边，是不是和我不够亲？",
    betterExplanation:
      "床尾往往同时满足陪伴、观察动线、保持舒适温度和随时离开的需要。睡眠位置只是关系线索之一，不能按离脸远近给感情排序。",
  },
  sameRoomNotBed: {
    id: "same_room_not_bed",
    ownerMayThink: "它和我同房却不上床，是不是不想靠近我？",
    betterExplanation:
      "它可能偏好自己的材质、温度和固定位置，同时仍把与你共享房间作为陪伴。对一些猫来说，同房守望比身体贴靠更自然。",
  },
  separateSleep: {
    id: "separate_sleep",
    ownerMayThink: "它总在别的房间睡，是不是感情比较淡？",
    betterExplanation:
      "睡眠位置会受到温度、安静程度、长期习惯和安全点影响。是否主动靠近、慢眨眼、蹭人和共享日间空间，比单独的睡觉地点更有解释价值。",
  },
  noGreeting: {
    id: "no_greeting",
    ownerMayThink: "我回家时它不迎接，是不是根本不想我？",
    betterExplanation:
      "有些猫把回家视为可预测的日常，不需要用高强度重逢确认关系。留在原处关注、稍后出现或恢复固定陪伴，也属于稳定的关系回应。",
  },
  noFollowing: {
    id: "no_following",
    ownerMayThink: "它不跟着我走，是不是不黏我、也不在乎我？",
    betterExplanation:
      "跟随只是依附表达之一。能够独自休息、在固定时段出现或通过共享空间保持联系，也可能说明它对关系足够有把握。",
  },
  strangerAvoidance: {
    id: "stranger_avoidance",
    ownerMayThink: "它见陌生人就躲，是不是胆子特别小？",
    betterExplanation:
      "躲避也可能是它有效的风险管理方式。真正需要关注的是刺激结束后能否恢复，而不是要求它必须主动见客。",
  },
  nameResponse: {
    id: "name_response",
    ownerMayThink: "叫名字不过来，是不是听不懂或者故意无视我？",
    betterExplanation:
      "注意到声音和愿意移动是两件事。看你一眼、转耳朵或稍后出现，都可能是回应；是否靠近还取决于当时动机。",
  },
  cautiousExplorer: {
    id: "cautious_explorer",
    ownerMayThink: "它先后退、后来又去看，是不是性格反复？",
    betterExplanation:
      "先拉开距离是在收集信息，随后靠近说明它完成了风险判断。谨慎和好奇可以同时很强，这正是它稳定的探索流程。",
  },
  selectiveSocial: {
    id: "selective_social",
    ownerMayThink: "它只亲近少数人，是不是性格不友好？",
    betterExplanation:
      "它只是把关系建立得更慢、更有选择。限定社交不代表敌意，也不需要强迫它把信任平均分给每一个人。",
  },
} as const;

export const ADVICE_LIBRARY: Record<string, AdviceItem> = {
  sensitivity_high: {
    id: "sensitivity_high",
    title: "给它先观察的时间",
    action: "新家具、访客或新物品出现时，保留远距离观察点和自由撤离路线，不要抱着它直接靠近。",
    reason: "它对环境变化较敏锐，观察本身就是建立安全感的过程。",
  },
  sensitivity_low: {
    id: "sensitivity_low",
    title: "大胆也要保留安全边界",
    action: "即使它很快靠近新物品，也要先排除绳线、夹缝、高温和不稳定高处等风险。",
    reason: "反应松弛不等于能够准确判断所有现实危险。",
  },
  exploration_high: {
    id: "exploration_high",
    title: "提供可以完成的探索任务",
    action: "轮换纸箱、嗅闻游戏、益智喂食器和垂直观察点，每次只增加少量新内容。",
    reason: "它需要持续的新鲜感和问题解决机会，但过量刺激会降低专注。",
  },
  exploration_low: {
    id: "exploration_low",
    title: "用熟悉感引导新体验",
    action: "把新玩具放在常用位置，先混入熟悉气味或食物，不要追着它要求立即参与。",
    reason: "它更偏好可预测环境，渐进变化比强迫尝试更容易建立兴趣。",
  },
  attachment_high: {
    id: "attachment_high",
    title: "建立可预测的陪伴时段",
    action: "每天安排固定的安静陪伴和互动时段，让它知道什么时候更容易获得回应。",
    reason: "稳定回应能满足关系确认需求，也可减少用叫喊或阻挡工作争取注意。",
  },
  attachment_low: {
    id: "attachment_low",
    title: "使用平行陪伴而不是追着亲近",
    action: "在同一空间各做各的，让它自行决定是否靠近，不用通过抱起或持续呼唤验证感情。",
    reason: "它可能更习惯低频、低强度的连接方式。",
  },
  sociability_high: {
    id: "sociability_high",
    title: "让社交保持低压力",
    action: "请访客先坐下、降低声音，让猫主动闻嗅；即使它热情，也不要多人同时围住触摸。",
    reason: "开放社交不等于没有身体边界，保留退出通道才能维持积极体验。",
  },
  sociability_low: {
    id: "sociability_low",
    title: "不要把见客当成必须完成的任务",
    action: "来客时提供独立安全房间、躲藏点和水食，允许它全程不出现。",
    reason: "选择性社交是一种稳定偏好，强迫暴露可能增加压力而非提升适应。",
  },
  autonomy_high: {
    id: "autonomy_high",
    title: "把选择权留在互动里",
    action: "触摸前先伸手等待，短暂接触后停一下；抱起、剪指甲或移动位置时尽量给出预告和退出机会。",
    reason: "它越能决定靠近和结束，越容易主动重复互动。",
  },
  autonomy_low: {
    id: "autonomy_low",
    title: "别把耐受当成持续愿意",
    action: "即使它很少反抗，也要观察尾巴加速、耳朵转向、身体僵硬和皮肤抖动等早期信号。",
    reason: "部分猫会先忍耐再突然升级，停止信号可能比直接离开更细微。",
  },
  stability_high: {
    id: "stability_high",
    title: "维持它已经建立的生活节奏",
    action: "尽量固定喂食、玩耍和安静时间，环境改变时分阶段进行。",
    reason: "它的稳定表现通常建立在可预测的日常结构上，不代表任何变化都不会造成压力。",
  },
  stability_low: {
    id: "stability_low",
    title: "用短而清楚的互动帮助降温",
    action: "把玩耍拆成多次短时段，结束前逐渐降低速度，并在兴奋后提供安静藏身点。",
    reason: "它的状态切换较快，明确的开始与结束有助于恢复。",
  },
  dislike_holding: {
    id: "dislike_holding",
    title: "把抱抱改成邀请",
    action: "优先用腿边坐垫、毯子或手势邀请它靠近，避免从上方突然抱起；必须抱时缩短时间并平稳放下。",
    reason: "它拒绝的是失去行动控制，不一定是拒绝与你接触。",
  },
  bed_foot: {
    id: "bed_foot",
    title: "保留床尾的自由通道",
    action: "不要在它睡着时突然抓抱，尽量让床尾到门口保持可移动路线。",
    reason: "这个位置可能同时承担陪伴、观察和随时离开的功能。",
  },
  same_room: {
    id: "same_room",
    title: "尊重同房不同位的陪伴",
    action: "在卧室或工作区为它准备稳定的小窝、垫子或高处，不必强行把它抱到床上。",
    reason: "它可能已经在用共享房间表达亲近，只是对具体休息点有自己的偏好。",
  },
  scent_bond: {
    id: "scent_bond",
    title: "保留一件熟悉气味物品",
    action: "搬家、寄养或短期环境变化时，可提供一件带有熟悉家庭气味且安全无绳线的织物。",
    reason: "熟悉气味可能帮助它在变化中更快建立稳定感。",
  },
  slow_blink: {
    id: "slow_blink",
    title: "用低强度方式回应它",
    action: "与它保持舒适距离，放松视线，缓慢眨眼后移开目光，不要持续直盯。",
    reason: "这更符合它温和、低压力的视觉互动节奏。",
  },
  keyboard_attention: {
    id: "keyboard_attention",
    title: "给注意力设置固定入口",
    action: "工作前先进行短时互动，并在桌边放置专属垫子；它安静待在垫子上时给予回应。",
    reason: "它已经学会挡屏幕或踩键盘能快速获得注意，需要用更可预测的替代方式。",
  },
  waiting_low: {
    id: "waiting_low",
    title: "提前处理容易爆发的等待场景",
    action: "固定喂食和开门流程，在等待前提供简单嗅闻或替代行为，不在升级后立刻用奖励结束冲突。",
    reason: "它对短暂挫败较敏感，越清楚下一步会发生什么，越不需要迅速加码。",
  },
  visitor_caution: {
    id: "visitor_caution",
    title: "让访客忽略它一会儿",
    action: "请访客不追、不盯、不主动伸手，把零食放在安全距离，让猫决定是否缩短距离。",
    reason: "减少社交压力能让谨慎猫更快完成观察，也避免把靠近变成被迫接触。",
  },
  puzzle_persistence: {
    id: "puzzle_persistence",
    title: "控制难度，让努力能得到回报",
    action: "益智玩具从容易成功的层级开始，连续失败时降低难度，不要一直让食物可见却拿不到。",
    reason: "它有持续解决问题的动力，但过高挫败可能把探索变成烦躁。",
  },
};
