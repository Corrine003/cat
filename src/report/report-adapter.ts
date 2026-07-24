import { buildCatReportFromScores } from "./cat-report-engine";
import type {
  AnswerValue,
  CatReportOutput,
  ChoiceAnswers,
  DimensionScoreMap,
  ReportInput,
} from "./cat-report-model";

type AppDimensionId =
  | "perception"
  | "exploration"
  | "attachment"
  | "social"
  | "autonomy"
  | "stability";

type AppProfile = {
  name: string;
  age: string;
  gender: string;
  arrival: string;
  family: string;
};

type AppReportSource = {
  profile: AppProfile;
  reportId: string;
  coreAnswers: Record<number, number | "unknown">;
  relationshipAnswers: Record<number, string>;
  strategyAnswers: Record<number, string>;
  safetyFlags: Record<number, boolean>;
  scores: Record<AppDimensionId, number | null>;
};

const scoreDimensionMap: Record<AppDimensionId, keyof DimensionScoreMap> = {
  perception: "sensitivity",
  exploration: "exploration",
  attachment: "attachment",
  social: "sociability",
  autonomy: "autonomy",
  stability: "stability",
};

function isAnswerValue(value: number | "unknown" | undefined): value is AnswerValue {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

function isChoiceValue(value: string | undefined): value is "A" | "B" | "C" | "D" | "E" {
  return value === "A" || value === "B" || value === "C" || value === "D" || value === "E";
}

function mapScores(scores: AppReportSource["scores"]): DimensionScoreMap | null {
  const output = {} as DimensionScoreMap;

  for (const [appDimension, reportDimension] of Object.entries(scoreDimensionMap) as Array<
    [AppDimensionId, keyof DimensionScoreMap]
  >) {
    const score = scores[appDimension];
    if (score === null) return null;
    output[reportDimension] = score;
  }

  return output;
}

function mapCoreAnswers(answers: AppReportSource["coreAnswers"]): ReportInput["coreAnswers"] {
  return Object.fromEntries(
    Object.entries(answers)
      .map(([questionId, value]) => [Number(questionId), value] as const)
      .filter((entry): entry is readonly [number, AnswerValue] => isAnswerValue(entry[1])),
  );
}

function mapChoiceAnswers(answers: Record<number, string>): ChoiceAnswers {
  return Object.fromEntries(
    Object.entries(answers)
      .map(([questionId, value]) => [Number(questionId), value] as const)
      .filter((entry): entry is readonly [number, "A" | "B" | "C" | "D" | "E"] => isChoiceValue(entry[1])),
  );
}

export function buildAppCatReport(source: AppReportSource): CatReportOutput | null {
  const scores = mapScores(source.scores);
  if (!scores) return null;

  return buildCatReportFromScores(
    {
      profile: {
        name: source.profile.name.trim() || "它",
        sex: source.profile.gender || undefined,
        ageText: source.profile.age || undefined,
        reportId: source.reportId,
      },
      coreAnswers: mapCoreAnswers(source.coreAnswers),
      relationshipAnswers: mapChoiceAnswers(source.relationshipAnswers),
      strategyAnswers: mapChoiceAnswers(source.strategyAnswers),
      context: {
        recentlyAdopted: source.profile.family === "临时寄养或刚到家",
        recoveringFromIllnessOrSurgery: Boolean(
          source.safetyFlags[0] ||
            source.safetyFlags[1] ||
            source.safetyFlags[2] ||
            source.safetyFlags[3],
        ),
        familyStructureChanged: Boolean(source.safetyFlags[4]),
      },
    },
    scores,
  );
}
