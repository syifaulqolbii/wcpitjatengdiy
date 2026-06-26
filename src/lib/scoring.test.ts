import { test, describe } from "node:test";
import * as assert from "node:assert";
import { calculatePoints, STAGE_SCORING, getStageScoringRules } from "./scoring";

describe("Scoring Engine", () => {
  // ─── Group Stage (unchanged) ───────────────────────────────
  test("returns 5 points for perfect score (group stage)", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1), 5); // Home win exact
    assert.strictEqual(calculatePoints(0, 0, 0, 0), 5); // Draw exact
    assert.strictEqual(calculatePoints(1, 3, 1, 3), 5); // Away win exact
  });

  test("returns 2 points for correct result (group stage)", () => {
    assert.strictEqual(calculatePoints(3, 1, 2, 0), 2); // Predicted Home Win, Actual Home Win
    assert.strictEqual(calculatePoints(1, 1, 2, 2), 2); // Predicted Draw, Actual Draw
    assert.strictEqual(calculatePoints(0, 1, 1, 2), 2); // Predicted Away Win, Actual Away Win
  });

  test("returns 0 points for wrong prediction (group stage)", () => {
    assert.strictEqual(calculatePoints(2, 1, 1, 1), 0); // Predicted Home Win, Actual Draw
    assert.strictEqual(calculatePoints(1, 1, 0, 1), 0); // Predicted Draw, Actual Away Win
    assert.strictEqual(calculatePoints(0, 1, 1, 0), 0); // Predicted Away Win, Actual Home Win
    assert.strictEqual(calculatePoints(2, 0, 0, 2), 0); // Predicted Home Win, Actual Away Win
  });

  // ─── Knockout Stages ───────────────────────────────────────
  test("round_32: perfect=6, correct=3", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1, 'round_32'), 6);
    assert.strictEqual(calculatePoints(3, 1, 2, 0, 'round_32'), 3);
    assert.strictEqual(calculatePoints(2, 0, 0, 2, 'round_32'), 0);
  });

  test("round_16: perfect=7, correct=4", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1, 'round_16'), 7);
    assert.strictEqual(calculatePoints(3, 1, 2, 0, 'round_16'), 4);
    assert.strictEqual(calculatePoints(2, 0, 0, 2, 'round_16'), 0);
  });

  test("quarter_final: perfect=8, correct=5", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1, 'quarter_final'), 8);
    assert.strictEqual(calculatePoints(3, 1, 2, 0, 'quarter_final'), 5);
    assert.strictEqual(calculatePoints(2, 0, 0, 2, 'quarter_final'), 0);
  });

  test("semi_final: perfect=10, correct=6", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1, 'semi_final'), 10);
    assert.strictEqual(calculatePoints(3, 1, 2, 0, 'semi_final'), 6);
    assert.strictEqual(calculatePoints(2, 0, 0, 2, 'semi_final'), 0);
  });

  test("juara_3: perfect=12, correct=7", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1, 'juara_3'), 12);
    assert.strictEqual(calculatePoints(3, 1, 2, 0, 'juara_3'), 7);
    assert.strictEqual(calculatePoints(2, 0, 0, 2, 'juara_3'), 0);
  });

  test("final: perfect=15, correct=10", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1, 'final'), 15);
    assert.strictEqual(calculatePoints(3, 1, 2, 0, 'final'), 10);
    assert.strictEqual(calculatePoints(2, 0, 0, 2, 'final'), 0);
  });

  // ─── Knockout Penalty Scenario ─────────────────────────────
  test("knockout penalty score scenario (combined score)", () => {
    // FT 0-0, PEN 5-4 → score final 5-4
    assert.strictEqual(calculatePoints(5, 4, 5, 4, 'semi_final'), 10); // perfect
    assert.strictEqual(calculatePoints(2, 1, 5, 4, 'semi_final'), 6);  // correct result (both home win)
    assert.strictEqual(calculatePoints(1, 2, 5, 4, 'semi_final'), 0);  // wrong
  });

  // ─── Edge Cases ────────────────────────────────────────────
  test("defaults to group_stage for unknown stage", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1, 'unknown_stage'), 5);
    assert.strictEqual(calculatePoints(3, 1, 2, 0, 'unknown_stage'), 2);
  });

  test("defaults to group_stage when stage is omitted", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1), 5);
  });

  // ─── STAGE_SCORING Map ─────────────────────────────────────
  test("STAGE_SCORING has all expected stages", () => {
    assert.ok(STAGE_SCORING.group_stage);
    assert.ok(STAGE_SCORING.round_32);
    assert.ok(STAGE_SCORING.round_16);
    assert.ok(STAGE_SCORING.quarter_final);
    assert.ok(STAGE_SCORING.semi_final);
    assert.ok(STAGE_SCORING.juara_3);
    assert.ok(STAGE_SCORING.final);
  });

  test("getStageScoringRules returns correct values", () => {
    const rules = getStageScoringRules('final');
    assert.strictEqual(rules.perfectScore, 15);
    assert.strictEqual(rules.correctResult, 10);
  });

  test("getStageScoringRules falls back to group_stage for unknown", () => {
    const rules = getStageScoringRules('nonexistent');
    assert.strictEqual(rules.perfectScore, 5);
    assert.strictEqual(rules.correctResult, 2);
  });
});
