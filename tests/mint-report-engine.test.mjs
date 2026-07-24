import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { build } from "esbuild";

test("mint sample matches the fixed cat report rule package", async () => {
  const sample = JSON.parse(
    await readFile(new URL("./fixtures/mint-sample.json", import.meta.url), "utf8"),
  );
  const tempDir = await mkdtemp(path.join(tmpdir(), "cat-report-mint-"));
  const entry = path.join(tempDir, "entry.ts");
  const output = path.join(tempDir, "entry.mjs");

  await writeFile(
    entry,
    `
      import { buildCatReportFromScores } from "${path.resolve("src/report/cat-report-engine.ts")}";
      const input = ${JSON.stringify(sample.input)};
      const scores = ${JSON.stringify(sample.precomputedScores)};
      export default buildCatReportFromScores(input, scores);
    `,
  );

  try {
    await build({
      entryPoints: [entry],
      bundle: true,
      format: "esm",
      outfile: output,
      platform: "node",
      target: "node20",
    });

    const report = (await import(output)).default;

    assert.equal(report.personality.scientificType, sample.expectedKeyOutput.scientificType);
    assert.equal(report.personality.mainTitle, sample.expectedKeyOutput.mainTitle);
    assert.equal(report.personality.coreJudgment, sample.expectedKeyOutput.coreJudgment);
    assert.equal(report.relationship.title, sample.expectedKeyOutput.relationshipType);
    assert.deepEqual(
      report.badges.map((badge) => badge.label),
      sample.expectedKeyOutput.badges,
    );
    assert.equal(report.relationshipQuote, sample.expectedKeyOutput.relationshipQuote);
    assert.equal(report.innerMonologue, sample.expectedKeyOutput.innerMonologue);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("app adapter maps existing questionnaire data into the report engine", async () => {
  const sample = JSON.parse(
    await readFile(new URL("./fixtures/mint-sample.json", import.meta.url), "utf8"),
  );
  const tempDir = await mkdtemp(path.join(tmpdir(), "cat-report-adapter-"));
  const entry = path.join(tempDir, "entry.ts");
  const output = path.join(tempDir, "entry.mjs");

  await writeFile(
    entry,
    `
      import { buildAppCatReport } from "${path.resolve("src/report/report-adapter.ts")}";
      const sampleInput = ${JSON.stringify(sample.input)};
      export default buildAppCatReport({
        profile: {
          name: sampleInput.profile.name,
          age: sampleInput.profile.ageText,
          gender: sampleInput.profile.sex,
          arrival: "",
          family: "单猫家庭",
        },
        reportId: sampleInput.profile.reportId,
        coreAnswers: sampleInput.coreAnswers,
        relationshipAnswers: sampleInput.relationshipAnswers,
        strategyAnswers: sampleInput.strategyAnswers,
        safetyFlags: {},
        scores: {
          perception: ${sample.precomputedScores.sensitivity},
          exploration: ${sample.precomputedScores.exploration},
          attachment: ${sample.precomputedScores.attachment},
          social: ${sample.precomputedScores.sociability},
          autonomy: ${sample.precomputedScores.autonomy},
          stability: ${sample.precomputedScores.stability},
        },
      });
    `,
  );

  try {
    await build({
      entryPoints: [entry],
      bundle: true,
      format: "esm",
      outfile: output,
      platform: "node",
      target: "node20",
    });

    const report = (await import(output)).default;

    assert.ok(report);
    assert.equal(report.personality.scientificType, sample.expectedKeyOutput.scientificType);
    assert.equal(report.personality.mainTitle, sample.expectedKeyOutput.mainTitle);
    assert.equal(report.scores.sensitivity, sample.precomputedScores.sensitivity);
    assert.equal(report.scores.sociability, sample.precomputedScores.sociability);
    assert.deepEqual(
      report.badges.map((badge) => badge.label),
      sample.expectedKeyOutput.badges,
    );
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
