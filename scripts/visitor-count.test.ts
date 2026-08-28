import assert from "node:assert/strict";
import test from "node:test";
import {
  createVisitorCounter,
  isAutomatedVisitor,
  VISITOR_COUNT_BASELINE,
  type VisitorCounterBackend,
} from "../src/lib/visitor-count";

function createBackend(initialValue: number | null) {
  let value = initialValue;
  const backend: VisitorCounterBackend = {
    async find() {
      return value;
    },
    async increment() {
      value = (value ?? 0) + 1;
      return value;
    },
  };

  return backend;
}

test("visitor counter reads the stored total without incrementing it", async () => {
  const counter = createVisitorCounter(createBackend(41));

  assert.equal(await counter.read(), 41);
  assert.equal(await counter.read(), 41);
});

test("visitor counter increments atomically through its backend", async () => {
  const counter = createVisitorCounter(createBackend(41));

  assert.equal(await counter.visit(), 42);
  assert.equal(await counter.read(), 42);
});

test("visitor counter starts from the configured public baseline", () => {
  assert.equal(VISITOR_COUNT_BASELINE, 675);
});

test("visitor counter normalizes missing and invalid totals", async () => {
  assert.equal(await createVisitorCounter(createBackend(null)).read(), 0);
  assert.equal(await createVisitorCounter(createBackend(-10)).read(), 0);
});

test("automated clients do not count as visitors", () => {
  assert.equal(isAutomatedVisitor(null), true);
  assert.equal(isAutomatedVisitor("curl/8.10.1"), true);
  assert.equal(isAutomatedVisitor("Mozilla/5.0 Googlebot/2.1"), true);
  assert.equal(
    isAutomatedVisitor(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36",
    ),
    false,
  );
});
