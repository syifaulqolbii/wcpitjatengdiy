import { test, describe } from "node:test";
import * as assert from "node:assert";
import { calculatePoints } from "./scoring";

describe("Scoring Engine", () => {
  test("returns 5 points for perfect score", () => {
    assert.strictEqual(calculatePoints(2, 1, 2, 1), 5); // Home win exact
    assert.strictEqual(calculatePoints(0, 0, 0, 0), 5); // Draw exact
    assert.strictEqual(calculatePoints(1, 3, 1, 3), 5); // Away win exact
  });

  test("returns 2 points for correct result (win/draw/loss)", () => {
    assert.strictEqual(calculatePoints(3, 1, 2, 0), 2); // Predicted Home Win, Actual Home Win
    assert.strictEqual(calculatePoints(1, 1, 2, 2), 2); // Predicted Draw, Actual Draw
    assert.strictEqual(calculatePoints(0, 1, 1, 2), 2); // Predicted Away Win, Actual Away Win
  });

  test("returns 0 points for wrong prediction", () => {
    assert.strictEqual(calculatePoints(2, 1, 1, 1), 0); // Predicted Home Win, Actual Draw
    assert.strictEqual(calculatePoints(1, 1, 0, 1), 0); // Predicted Draw, Actual Away Win
    assert.strictEqual(calculatePoints(0, 1, 1, 0), 0); // Predicted Away Win, Actual Home Win
    assert.strictEqual(calculatePoints(2, 0, 0, 2), 0); // Predicted Home Win, Actual Away Win
  });
});
