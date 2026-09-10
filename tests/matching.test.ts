import test from "node:test";
import assert from "node:assert/strict";
import { computeMatchScore, rankCandidates } from "../src/lib/matching.ts";

test("computeMatchScore: no overlap, no city match, unverified => 0", () => {
  const score = computeMatchScore(
    { id: "c1", category_ids: ["cat-a"], city_id: "karachi", verification_status: "unverified" },
    { category_ids: ["cat-b"], city_id: "lahore" }
  );
  assert.equal(score, 0);
});

test("computeMatchScore: one category overlap => 50", () => {
  const score = computeMatchScore(
    { id: "c1", category_ids: ["hvac"], city_id: null, verification_status: "unverified" },
    { category_ids: ["hvac"], city_id: null }
  );
  assert.equal(score, 50);
});

test("computeMatchScore: category + city match => 80", () => {
  const score = computeMatchScore(
    { id: "c1", category_ids: ["hvac"], city_id: "karachi", verification_status: "unverified" },
    { category_ids: ["hvac"], city_id: "karachi" }
  );
  assert.equal(score, 80);
});

test("computeMatchScore: category + city + verified => 100", () => {
  const score = computeMatchScore(
    { id: "c1", category_ids: ["hvac"], city_id: "karachi", verification_status: "verified" },
    { category_ids: ["hvac"], city_id: "karachi" }
  );
  assert.equal(score, 100);
});

test("computeMatchScore: multiple category overlaps stack", () => {
  const score = computeMatchScore(
    { id: "c1", category_ids: ["hvac", "mep"], city_id: null, verification_status: "unverified" },
    { category_ids: ["hvac", "mep"], city_id: null }
  );
  assert.equal(score, 100);
});

test("rankCandidates: sorts descending by score and respects limit", () => {
  const candidates = [
    { id: "low", category_ids: [], city_id: null, verification_status: "unverified" },
    { id: "high", category_ids: ["hvac"], city_id: "karachi", verification_status: "verified" },
    { id: "mid", category_ids: ["hvac"], city_id: null, verification_status: "unverified" },
  ];
  const ranked = rankCandidates(candidates, { category_ids: ["hvac"], city_id: "karachi" }, 2);

  assert.equal(ranked.length, 2);
  assert.equal(ranked[0].id, "high");
  assert.equal(ranked[1].id, "mid");
});

test("rankCandidates: empty candidate list returns empty array", () => {
  const ranked = rankCandidates([], { category_ids: ["hvac"], city_id: null });
  assert.deepEqual(ranked, []);
});
