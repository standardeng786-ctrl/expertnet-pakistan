// Pure, dependency-free scoring logic used by the smart-matching engine
// (PRD Section 10.2). Kept separate from the API route so it can be unit
// tested without a live Supabase connection.

export interface MatchCandidate {
  id: string;
  category_ids: string[];
  city_id: string | null;
  verification_status: string;
}

export interface MatchRequirement {
  category_ids: string[];
  city_id: string | null;
}

export function computeMatchScore(candidate: MatchCandidate, requirement: MatchRequirement): number {
  const categoryOverlap = (candidate.category_ids ?? []).filter((id) =>
    (requirement.category_ids ?? []).includes(id)
  ).length;

  let score = categoryOverlap * 50;
  if (requirement.city_id && candidate.city_id === requirement.city_id) score += 30;
  if (candidate.verification_status === "verified") score += 20;
  return score;
}

export function rankCandidates<T extends MatchCandidate>(
  candidates: T[],
  requirement: MatchRequirement,
  limit = 15
): Array<T & { match_score: number }> {
  return candidates
    .map((c) => ({ ...c, match_score: computeMatchScore(c, requirement) }))
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit);
}
