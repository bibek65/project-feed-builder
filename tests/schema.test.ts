import test from "node:test";
import assert from "node:assert/strict";
import { validateProject } from "../src/schema.js";

test("rejects unsafe repository links", () => {
  assert.throws(() => validateProject({ name: "Bad", slug: "bad", summary: "x", repository: "http://example.com", topics: [] }, "fixture"), /GitHub HTTPS/);
});
