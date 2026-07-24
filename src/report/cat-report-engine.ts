import type {
  AdviceItem,
  BehaviorBadge,
  BehaviorEvidence,
  CatReportOutput,
  ChoiceAnswers,
  ConfidenceResult,
  CoreAnswers,
  DimensionId,
  DimensionResult,
  DimensionScoreMap,
  MisunderstandingCard,
  PersonalityTemplate,
  RelationshipTypeResult,
  ReportInput,
  ScoreBand,
} from "./cat-report-model";
import {
  ADVICE_LIBRARY,
  BADGE_RULES,
  BALANCED_PERSONALITY,
  CORE_QUESTION_IDS,
  DIMENSION_ORDER,
  EVIDENCE_RULES,
  LOW_DIMENSION_NOTES,
  MISUNDERSTANDING_COPY,
  PAIR_PERSONALITIES,
  RELATIONSHIP_EVIDENCE,
  RELATIONSHIP_TEMPLATES,
  REVERSE_QUESTION_IDS,
  SINGLE_DIMENSION_PERSONALITIES,
} from "./cat-report-copy.zh-CN";

const REQUIRED_ANSWERS_PER_DIMENSION = 6;

function round(value: number): number {
  return Math.round(value);
}

function classifyBand(score: number | null): ScoreBand {
  if (score === null) return "insufficient";
  if (score <= 32) return "low";
  if (score <= 67) return "typical";
  return "high";
}

export function calculateDimensionResults(
  answers: CoreAnswers,
): Record<DimensionId, DimensionResult> {
  const result = {} as Record<DimensionId, DimensionResult>;

  for (const dimension of DIMENSION_ORDER) {
    const questionIds = CORE_QUESTION_IDS[dimension];
    const validScores: number[] = [];

    for (const questionId of questionIds) {
      const raw = answers[questionId];
      if (raw === undefined) continue;
      validScores.push(REVERSE_QUESTION_IDS.has(questionId) ? 6 - raw : raw);
    }

    const score =
      validScores.length >= REQUIRED_ANSWERS_PER_DIMENSION
        ? round(
            ((validScores.reduce((sum, value) => sum + value, 0) /
              validScores.length -
              1) /
              4) *
              100,
          )
        : null;

    result[dimension] = {
      id: dimension,
      score,
      band: classifyBand(score),
      answeredCount: validScores.length,
      requiredCount: REQUIRED_ANSWERS_PER_DIMENSION,
    };
  }

  return result;
}

function requireScores(
  results: Record<DimensionId, DimensionResult>,
): DimensionScoreMap {
  const scores = {} as DimensionScoreMap;
  for (const dimension of DIMENSION_ORDER) {
    const score = results[dimension].score;
    if (score === null) {
      throw new Error(`维度 ${dimension} 有效答案不足，无法生成正式报告。`);
    }
    scores[dimension] = score;
  }
  return scores;
}

function calculateConfidence(input: ReportInput): ConfidenceResult {
  const answered = Object.values(input.coreAnswers).filter(
    (value) => value !== undefined,
  ).length;
  const completeness = answered / 48;
  const contextRisk = Boolean(
    input.context?.recentlyMoved ||
      input.context?.recentlyAdopted ||
      input.context?.recoveringFromIllnessOrSurgery ||
      input.context?.familyStructureChanged,
  );

  if (contextRisk || completeness < 0.75) {
    return {
      level: "low",
      completeness,
      note: contextRisk
        ? "近期环境或身体状态发生变化，这份画像更接近一次阶段性观察。建议生活稳定两周后重新测试。"
        : "核心题有效回答较少，这份画像仅作为初步参考。",
    };
  }

  if (completeness < 0.92) {
    return {
      level: "medium",
      completeness,
      note: "大部分行为已有观察依据，少量未观察题可能影响个别维度的细节。",
    };
  }

  return {
    level: "high",
    completeness,
    note: "核心行为观察较完整，结果适合用于理解当前稳定生活中的性格倾向。",
  };
}

function sortedDimensions(scores: DimensionScoreMap): Array<[DimensionId, number]> {
  const priority = new Map(DIMENSION_ORDER.map((dimension, index) => [dimension, index]));
  return DIMENSION_ORDER.map((dimension) => [dimension, scores[dimension]] as [DimensionId, number]).sort(
    (a, b) => b[1] - a[1] || (priority.get(a[0]) ?? 0) - (priority.get(b[0]) ?? 0),
  );
}

function pairMatches(template: PersonalityTemplate, a: DimensionId, b: DimensionId): boolean {
  return (
    template.dimensions.length === 2 &&
    template.dimensions.includes(a) &&
    template.dimensions.includes(b)
  );
}

export function selectPersonality(scores: DimensionScoreMap): PersonalityTemplate {
  const sorted = sortedDimensions(scores);
  const top = sorted[0];
  const second = sorted[1];
  const lowest = sorted.at(-1);
  if (!top || !second || !lowest) return BALANCED_PERSONALITY;

  const spread = top[1] - lowest[1];
  if (spread < 12) return BALANCED_PERSONALITY;

  if (top[1] >= 85 && top[1] - second[1] >= 15) {
    return SINGLE_DIMENSION_PERSONALITIES[top[0]];
  }

  return (
    PAIR_PERSONALITIES.find((template) => pairMatches(template, top[0], second[0])) ??
    BALANCED_PERSONALITY
  );
}

function answerIs(answers: ChoiceAnswers, questionId: number, values: string[]): boolean {
  const value = answers[questionId];
  return value !== undefined && values.includes(value);
}

type RelationshipSignalId =
  | "boundary_companion"
  | "close_contact"
  | "shared_space"
  | "watchful_companion"
  | "selective_trust"
  | "independent_secure"
  | "social_warm"
  | "flexible_companion";

function scoreRelationshipSignals(
  scores: DimensionScoreMap,
  relationshipAnswers: ChoiceAnswers,
): Record<RelationshipSignalId, number> {
  const signal: Record<RelationshipSignalId, number> = {
    boundary_companion: 0,
    close_contact: 0,
    shared_space: 0,
    watchful_companion: 0,
    selective_trust: 0,
    independent_secure: 0,
    social_warm: 0,
    flexible_companion: 1,
  };

  if (scores.attachment >= 60) signal.boundary_companion += 2;
  if (scores.autonomy >= 68) signal.boundary_companion += 3;
  if (answerIs(relationshipAnswers, 49, ["B", "C", "D"])) signal.boundary_companion += 1;
  if (answerIs(relationshipAnswers, 50, ["C", "D"])) signal.boundary_companion += 1;

  if (answerIs(relationshipAnswers, 49, ["A"])) signal.close_contact += 3;
  if (answerIs(relationshipAnswers, 50, ["A"])) signal.close_contact += 3;
  if (answerIs(relationshipAnswers, 51, ["A", "B"])) signal.close_contact += 1;
  if (answerIs(relationshipAnswers, 53, ["A"])) signal.close_contact += 1;
  if (answerIs(relationshipAnswers, 57, ["A"])) signal.close_contact += 1;

  if (answerIs(relationshipAnswers, 49, ["C", "D"])) signal.shared_space += 3;
  if (answerIs(relationshipAnswers, 50, ["B", "C"])) signal.shared_space += 1;
  if (answerIs(relationshipAnswers, 57, ["B", "C"])) signal.shared_space += 3;
  if (answerIs(relationshipAnswers, 52, ["B", "C", "D"])) signal.shared_space += 1;

  if (answerIs(relationshipAnswers, 49, ["B", "D"])) signal.watchful_companion += 3;
  if (answerIs(relationshipAnswers, 50, ["D"])) signal.watchful_companion += 3;
  if (answerIs(relationshipAnswers, 53, ["B"])) signal.watchful_companion += 2;
  if (answerIs(relationshipAnswers, 59, ["B", "D"])) signal.watchful_companion += 1;

  if (scores.sociability <= 45) signal.selective_trust += 3;
  if (scores.attachment >= 55) signal.selective_trust += 2;
  if (answerIs(relationshipAnswers, 54, ["A", "B"])) signal.selective_trust += 1;
  if (answerIs(relationshipAnswers, 55, ["A", "B"])) signal.selective_trust += 1;
  if (answerIs(relationshipAnswers, 52, ["B", "C", "D"])) signal.selective_trust += 1;

  if (scores.attachment <= 45) signal.independent_secure += 3;
  if (scores.stability >= 60) signal.independent_secure += 1;
  if (answerIs(relationshipAnswers, 49, ["E"])) signal.independent_secure += 3;
  if (answerIs(relationshipAnswers, 53, ["E"])) signal.independent_secure += 2;
  if (answerIs(relationshipAnswers, 57, ["D"])) signal.independent_secure += 1;
  if (answerIs(relationshipAnswers, 52, ["D"])) signal.independent_secure += 1;

  if (scores.sociability >= 68) signal.social_warm += 3;
  if (scores.attachment >= 60) signal.social_warm += 2;
  if (answerIs(relationshipAnswers, 52, ["A"])) signal.social_warm += 1;
  if (answerIs(relationshipAnswers, 55, ["A"])) signal.social_warm += 1;
  if (answerIs(relationshipAnswers, 56, ["A"])) signal.social_warm += 1;

  return signal;
}

function getRelationshipTemplate(id: string): RelationshipTypeResult {
  const template = RELATIONSHIP_TEMPLATES[id];
  if (!template) throw new Error(`缺少关系文案模板: ${id}`);
  return template;
}

export function selectRelationshipType(
  scores: DimensionScoreMap,
  coreAnswers: CoreAnswers,
  relationshipAnswers: ChoiceAnswers,
): RelationshipTypeResult {
  if (scores.attachment >= 60 && scores.autonomy >= 68 && (coreAnswers[35] ?? 3) >= 4) {
    return getRelationshipTemplate("boundary_companion");
  }

  if (
    scores.sociability <= 45 &&
    scores.attachment >= 55 &&
    (answerIs(relationshipAnswers, 54, ["A", "B"]) ||
      answerIs(relationshipAnswers, 55, ["A", "B"]))
  ) {
    return getRelationshipTemplate("selective_trust");
  }

  const signals = scoreRelationshipSignals(scores, relationshipAnswers);
  const selected = Object.entries(signals).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "flexible_companion";
  return getRelationshipTemplate(selected);
}

export function selectBadges(
  coreAnswers: CoreAnswers,
  relationshipAnswers: ChoiceAnswers,
  strategyAnswers: ChoiceAnswers,
): BehaviorBadge[] {
  const candidates = BADGE_RULES.filter((rule) => {
    const source = rule.questionId <= 60 ? relationshipAnswers : strategyAnswers;
    return source[rule.questionId] === rule.answer;
  }).map<BehaviorBadge>((rule) => ({
    id: rule.id,
    label: rule.label,
    sourceQuestionId: rule.questionId,
    category: rule.category,
    priority: rule.priority,
  }));

  if ((coreAnswers[35] ?? 3) >= 4) {
    candidates.push({
      id: "holding_by_appointment",
      label: "抱抱需预约",
      sourceQuestionId: 35,
      category: "trust",
      priority: 101,
    });
  }
  if ((coreAnswers[34] ?? 3) >= 4) {
    candidates.push({
      id: "clear_boundary_signal",
      label: "边界信号清晰",
      sourceQuestionId: 34,
      category: "trust",
      priority: 89,
    });
  }

  const categoryOrder: BehaviorBadge["category"][] = ["sleep", "trust", "strategy"];
  const selected: BehaviorBadge[] = [];
  for (const category of categoryOrder) {
    const best = candidates
      .filter((candidate) => candidate.category === category)
      .sort((a, b) => b.priority - a.priority)[0];
    if (best) selected.push(best);
  }
  return selected;
}

export function selectBehaviorEvidence(
  coreAnswers: CoreAnswers,
  relationshipAnswers: ChoiceAnswers,
  count = 6,
): BehaviorEvidence[] {
  const coreCandidates: Array<BehaviorEvidence & { salience: number }> = [];

  for (const rule of EVIDENCE_RULES) {
    const answer = coreAnswers[rule.questionId];
    if (answer === undefined) continue;
    const copy = answer >= 4 ? rule.high : answer <= 2 ? rule.low : undefined;
    if (!copy) continue;
    coreCandidates.push({
      ...copy,
      sourceQuestionId: rule.questionId,
      salience: copy.priority + Math.abs(answer - 3) * 8,
    });
  }

  const relationCandidates: Array<BehaviorEvidence & { salience: number }> = [];
  for (const [questionIdText, answer] of Object.entries(relationshipAnswers)) {
    if (!answer) continue;
    const questionId = Number(questionIdText);
    const copy = RELATIONSHIP_EVIDENCE[questionId]?.[answer];
    if (!copy) continue;
    relationCandidates.push({
      ...copy,
      sourceQuestionId: questionId,
      salience: copy.priority + 6,
    });
  }

  const selected = [
    ...coreCandidates.sort((a, b) => b.salience - a.salience).slice(0, 3),
    ...relationCandidates.sort((a, b) => b.salience - a.salience).slice(0, 3),
  ]
    .sort((a, b) => b.salience - a.salience)
    .slice(0, count)
    .map(({ salience: _salience, ...evidence }) => evidence);

  return selected;
}

export function selectMisunderstanding(
  scores: DimensionScoreMap,
  coreAnswers: CoreAnswers,
  relationshipAnswers: ChoiceAnswers,
): MisunderstandingCard {
  if ((coreAnswers[35] ?? 3) >= 4 || (coreAnswers[38] ?? 3) >= 4) {
    return MISUNDERSTANDING_COPY.dislikeHolding;
  }
  if (scores.attachment >= 60 && scores.autonomy >= 68) {
    return MISUNDERSTANDING_COPY.closenessAndAutonomy;
  }
  if (relationshipAnswers[49] === "B") return MISUNDERSTANDING_COPY.bedFoot;
  if (relationshipAnswers[49] === "D") return MISUNDERSTANDING_COPY.sameRoomNotBed;
  if (relationshipAnswers[49] === "E") return MISUNDERSTANDING_COPY.separateSleep;
  if (relationshipAnswers[52] === "D" || relationshipAnswers[52] === "E") {
    return MISUNDERSTANDING_COPY.noGreeting;
  }
  if (relationshipAnswers[53] === "E") return MISUNDERSTANDING_COPY.noFollowing;
  if (scores.sensitivity >= 68 && scores.exploration >= 68) {
    return MISUNDERSTANDING_COPY.cautiousExplorer;
  }
  if (scores.sociability <= 45) return MISUNDERSTANDING_COPY.selectiveSocial;
  if (["C", "D", "E"].includes(relationshipAnswers[60] ?? "")) {
    return MISUNDERSTANDING_COPY.nameResponse;
  }
  if (scores.sensitivity >= 68) return MISUNDERSTANDING_COPY.strangerAvoidance;
  return MISUNDERSTANDING_COPY.closenessAndAutonomy;
}

function addAdvice(
  output: AdviceItem[],
  used: Set<string>,
  id: string,
): void {
  const item = ADVICE_LIBRARY[id];
  if (!item || used.has(id)) return;
  output.push(item);
  used.add(id);
}

export function selectAdvice(
  scores: DimensionScoreMap,
  coreAnswers: CoreAnswers,
  relationshipAnswers: ChoiceAnswers,
  count = 4,
): AdviceItem[] {
  const specificCandidates: Array<{ id: string; priority: number }> = [];
  const pushSpecific = (condition: boolean, id: string, priority: number): void => {
    if (condition) specificCandidates.push({ id, priority });
  };

  pushSpecific((coreAnswers[35] ?? 3) >= 4 || (coreAnswers[38] ?? 3) >= 4, "dislike_holding", 100);
  pushSpecific((coreAnswers[42] ?? 3) <= 2 || (coreAnswers[48] ?? 3) >= 4, "waiting_low", 96);
  pushSpecific(relationshipAnswers[57] === "E", "keyboard_attention", 94);
  pushSpecific((coreAnswers[2] ?? 3) >= 4, "visitor_caution", 92);
  pushSpecific((coreAnswers[13] ?? 3) >= 4 && (coreAnswers[14] ?? 3) >= 4, "puzzle_persistence", 90);
  pushSpecific(relationshipAnswers[49] === "B", "bed_foot", 86);
  pushSpecific(relationshipAnswers[49] === "D", "same_room", 86);
  pushSpecific(relationshipAnswers[54] === "A", "slow_blink", 84);
  pushSpecific(["A", "B"].includes(relationshipAnswers[51] ?? ""), "scent_bond", 82);

  const output: AdviceItem[] = [];
  const used = new Set<string>();
  const reservedForDimensions = Math.min(2, count);
  const specificLimit = Math.max(0, count - reservedForDimensions);

  for (const candidate of specificCandidates.sort((a, b) => b.priority - a.priority).slice(0, specificLimit)) {
    addAdvice(output, used, candidate.id);
  }

  const sorted = sortedDimensions(scores);
  for (const [dimension, score] of sorted) {
    if (output.length >= count) break;
    if (score >= 68) addAdvice(output, used, `${dimension}_high`);
  }

  for (const candidate of specificCandidates.sort((a, b) => b.priority - a.priority)) {
    if (output.length >= count) break;
    addAdvice(output, used, candidate.id);
  }

  for (const [dimension, score] of [...sorted].reverse()) {
    if (output.length >= count) break;
    if (score <= 32) addAdvice(output, used, `${dimension}_low`);
  }

  for (const [dimension] of sorted) {
    if (output.length >= count) break;
    addAdvice(output, used, `${dimension}_high`);
  }

  return output.slice(0, count);
}

function buildScientificSummary(
  name: string,
  personality: PersonalityTemplate,
  relationship: RelationshipTypeResult,
  evidence: BehaviorEvidence[],
  misunderstanding: MisunderstandingCard,
  advice: AdviceItem[],
): string {
  const evidenceSentence = evidence
    .slice(0, 3)
    .map((item) => item.behavior)
    .join("；");
  const adviceSentence = advice[0]
    ? `更适合它的相处方式，是${advice[0].action}`
    : "更适合它的相处方式，是保留稳定节奏和自主退出空间。";

  return [
    `${name}面对世界时，${personality.worldAnalysis}`,
    personality.conflictAnalysis,
    `在具体行为上，${evidenceSentence}。这些细节让报告不只停留在分数，而能看见它实际如何做决定。`,
    relationship.summary,
    `主人有时会误以为“${misunderstanding.ownerMayThink}”${misunderstanding.betterExplanation}`,
    adviceSentence,
  ].join("\n\n");
}

function dimensionResultsFromScores(
  scores: DimensionScoreMap,
  coreAnswers: CoreAnswers,
): Record<DimensionId, DimensionResult> {
  const results = {} as Record<DimensionId, DimensionResult>;
  for (const dimension of DIMENSION_ORDER) {
    const answeredCount = CORE_QUESTION_IDS[dimension].filter(
      (questionId) => coreAnswers[questionId] !== undefined,
    ).length;
    results[dimension] = {
      id: dimension,
      score: scores[dimension],
      band: classifyBand(scores[dimension]),
      answeredCount,
      requiredCount: REQUIRED_ANSWERS_PER_DIMENSION,
    };
  }
  return results;
}

function assembleReport(
  input: ReportInput,
  scores: DimensionScoreMap,
  dimensionResults: Record<DimensionId, DimensionResult>,
): CatReportOutput {
  const confidence = calculateConfidence(input);
  const personality = selectPersonality(scores);
  const relationship = selectRelationshipType(
    scores,
    input.coreAnswers,
    input.relationshipAnswers,
  );
  const evidence = selectBehaviorEvidence(
    input.coreAnswers,
    input.relationshipAnswers,
    6,
  );
  const misunderstanding = selectMisunderstanding(
    scores,
    input.coreAnswers,
    input.relationshipAnswers,
  );
  const advice = selectAdvice(
    scores,
    input.coreAnswers,
    input.relationshipAnswers,
    4,
  );
  const badges = selectBadges(input.coreAnswers, input.relationshipAnswers, input.strategyAnswers);
  const sorted = sortedDimensions(scores);
  const lowest = sorted.at(-1);
  const lowestDimensionNote = lowest && lowest[1] <= 32 ? LOW_DIMENSION_NOTES[lowest[0]] : undefined;

  return {
    profile: input.profile,
    dimensionResults,
    scores,
    confidence,
    personality,
    relationship,
    behaviorEvidence: evidence,
    misunderstanding,
    advice,
    badges,
    scientificSummary: buildScientificSummary(
      input.profile.name,
      personality,
      relationship,
      evidence,
      misunderstanding,
      advice,
    ),
    shortSummary: `${personality.coreJudgment}${personality.posterSummary}`,
    relationshipQuote: relationship.quote,
    innerMonologue: relationship.innerMonologue,
    ...(lowestDimensionNote ? { lowestDimensionNote } : {}),
  };
}

export function buildCatReport(input: ReportInput): CatReportOutput {
  const dimensionResults = calculateDimensionResults(input.coreAnswers);
  const scores = requireScores(dimensionResults);
  return assembleReport(input, scores, dimensionResults);
}

/**
 * 现有项目已经完成六维评分时，结果页可直接使用这个入口。
 * 分数仍需来自固定评分算法，不允许由页面或AI临时生成。
 */
export function buildCatReportFromScores(
  input: ReportInput,
  scores: DimensionScoreMap,
): CatReportOutput {
  return assembleReport(input, scores, dimensionResultsFromScores(scores, input.coreAnswers));
}
