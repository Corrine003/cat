export type DimensionId =
  | "sensitivity"
  | "exploration"
  | "attachment"
  | "sociability"
  | "autonomy"
  | "stability";

export type ScoreBand = "low" | "typical" | "high" | "insufficient";
export type ConfidenceLevel = "low" | "medium" | "high";
export type AnswerValue = 1 | 2 | 3 | 4 | 5;
export type CoreAnswers = Partial<Record<number, AnswerValue>>;
export type ChoiceAnswers = Partial<Record<number, "A" | "B" | "C" | "D" | "E">>;

export interface CatProfile {
  name: string;
  sex?: string;
  ageText?: string;
  breed?: string;
  reportId?: string;
  generatedAt?: string;
}

export interface DimensionResult {
  id: DimensionId;
  score: number | null;
  band: ScoreBand;
  answeredCount: number;
  requiredCount: number;
}

export type DimensionScoreMap = Record<DimensionId, number>;

export interface QuestionnaireContext {
  recentlyMoved?: boolean;
  recentlyAdopted?: boolean;
  recoveringFromIllnessOrSurgery?: boolean;
  familyStructureChanged?: boolean;
}

export interface ReportInput {
  profile: CatProfile;
  coreAnswers: CoreAnswers;
  relationshipAnswers: ChoiceAnswers;
  strategyAnswers: ChoiceAnswers;
  context?: QuestionnaireContext;
}

export interface PersonalityTypeResult {
  id: string;
  dimensions: DimensionId[];
  scientificType: string;
  mainTitle: string;
  coreJudgment: string;
  worldAnalysis: string;
  conflictAnalysis: string;
  posterSummary: string;
}

export interface RelationshipTypeResult {
  id: string;
  title: string;
  summary: string;
  quote: string;
  innerMonologue: string;
}

export interface BehaviorEvidence {
  sourceQuestionId: number;
  behavior: string;
  interpretation: string;
  priority: number;
}

export interface BehaviorBadge {
  id: string;
  label: string;
  sourceQuestionId: number;
  category: "sleep" | "trust" | "strategy";
  priority: number;
}

export interface MisunderstandingCard {
  id: string;
  ownerMayThink: string;
  betterExplanation: string;
}

export interface AdviceItem {
  id: string;
  title: string;
  action: string;
  reason: string;
}

export interface ConfidenceResult {
  level: ConfidenceLevel;
  completeness: number;
  note: string;
}

export interface CatReportOutput {
  profile: CatProfile;
  dimensionResults: Record<DimensionId, DimensionResult>;
  scores: DimensionScoreMap;
  confidence: ConfidenceResult;
  personality: PersonalityTypeResult;
  relationship: RelationshipTypeResult;
  behaviorEvidence: BehaviorEvidence[];
  misunderstanding: MisunderstandingCard;
  advice: AdviceItem[];
  badges: BehaviorBadge[];
  scientificSummary: string;
  shortSummary: string;
  relationshipQuote: string;
  innerMonologue: string;
  lowestDimensionNote?: string;
}

export interface PersonalityTemplate {
  id: string;
  dimensions: DimensionId[];
  scientificType: string;
  mainTitle: string;
  coreJudgment: string;
  worldAnalysis: string;
  conflictAnalysis: string;
  posterSummary: string;
}

export interface RelationshipTemplate {
  id: string;
  title: string;
  summary: string;
  quote: string;
  innerMonologue: string;
}

export interface EvidenceRule {
  questionId: number;
  high?: Omit<BehaviorEvidence, "sourceQuestionId">;
  low?: Omit<BehaviorEvidence, "sourceQuestionId">;
}

export interface BadgeRule {
  questionId: number;
  answer: "A" | "B" | "C" | "D" | "E";
  id: string;
  label: string;
  category: BehaviorBadge["category"];
  priority: number;
}
