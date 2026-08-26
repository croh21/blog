import { ScoringWeights, Trend } from "@/types";

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  searchGrowth: 0.20,
  searchVolume: 0.15,
  newsMomentum: 0.10,
  socialInterest: 0.10,
  commercialValue: 0.20,
  evergreen: 0.15,
  competition: 0.10, // Inverted: low competition yields high score
};

/**
 * Calculates the Opportunity Score (0~100) based on weighted factors:
 * High Growth + High Volume + High Commercial + High Evergreen + Low Competition
 */
export function calculateOpportunityScore(
  trend: Partial<Trend>,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): number {
  const searchGrowth = Math.min(100, Math.max(0, trend.search_growth ?? 50));
  const searchVolume = Math.min(100, Math.max(0, trend.search_volume ?? 50));
  const newsMomentum = Math.min(100, Math.max(0, trend.trend_score ?? 50));
  const socialInterest = Math.min(100, Math.max(0, trend.social_score ?? 50));
  const commercialValue = Math.min(100, Math.max(0, trend.commercial_score ?? 50));
  const evergreen = Math.min(100, Math.max(0, trend.evergreen_score ?? 50));
  
  // Competition: higher competition is disadvantageous -> inverted (100 - competition)
  const competitionScore = Math.min(100, Math.max(0, trend.competition_score ?? 50));
  const invertedCompetition = 100 - competitionScore;

  const rawScore =
    searchGrowth * weights.searchGrowth +
    searchVolume * weights.searchVolume +
    newsMomentum * weights.newsMomentum +
    socialInterest * weights.socialInterest +
    commercialValue * weights.commercialValue +
    evergreen * weights.evergreen +
    invertedCompetition * weights.competition;

  return Math.round(rawScore * 10) / 10;
}
