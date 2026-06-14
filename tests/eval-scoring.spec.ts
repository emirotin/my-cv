import { expect, test } from "@playwright/test";
import { EVAL_CASES, parseActionResponse, scoreActionResponse } from "../src/lib/eval-config";

const casesById = new Map(EVAL_CASES.map((evalCase) => [evalCase.id, evalCase]));

test("scoring accepts concise but correct location answers", () => {
  const score = scoreActionResponse(
    mustGetCase("location-availability"),
    '{"answer":"Eugene is based in Tallinn, Estonia and is available for remote engagements.","kind":"answer","tool":null}',
  );

  expect(score.failures).toEqual([]);
  expect(score.passed).toBe(true);
});

test("scoring accepts two supported AI Studio facts without requiring every possible fact", () => {
  const score = scoreActionResponse(
    mustGetCase("speechify-ai-studio"),
    '{"answer":"Led the ground-up rebuild of Voice Over Studio v2, optimizing AI podcast generation and migrating from Firestore to PostgreSQL.", "kind":"answer", "tool":null}',
  );

  expect(score.failures).toEqual([]);
  expect(score.passed).toBe(true);
});

test("scoring accepts role attribution for the IoT terminal case", () => {
  const score = scoreActionResponse(
    mustGetCase("iot-terminal"),
    '{"answer":"Resin.io (now Balena)","kind":"answer","tool":null}',
  );

  expect(score.failures).toEqual([]);
  expect(score.passed).toBe(true);
});

test("scoring accepts unknown phone wording with does not provide", () => {
  const score = scoreActionResponse(
    mustGetCase("phone-unknown"),
    '{"answer":"The CV does not provide Eugene\'s phone number.","kind":"answer","tool":null}',
  );

  expect(score.failures).toEqual([]);
  expect(score.passed).toBe(true);
});

test("scoring still rejects answers that omit requested Python context", () => {
  const score = scoreActionResponse(
    mustGetCase("python-scope"),
    '{"answer":"No, Python is not listed as one of Eugene\'s core languages.", "kind":"answer","tool":null}',
  );

  expect(score.passed).toBe(false);
  expect(score.failures.join(" ")).toContain("buildsite");
});

test("action parser accepts a tool JSON object wrapped in model text", () => {
  expect(
    parseActionResponse('Here is the action:\n{"answer":null,"kind":"tool","tool":"send_email"}'),
  ).toEqual({
    answer: null,
    kind: "tool",
    tool: "send_email",
  });
});

function mustGetCase(id: string) {
  const evalCase = casesById.get(id);
  if (!evalCase) {
    throw new Error(`Missing eval case ${id}`);
  }

  return evalCase;
}
