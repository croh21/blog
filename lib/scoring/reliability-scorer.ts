import { ArticleClaim, Source, SourceTier, SourceType } from "@/types";

export const SOURCE_TIER_SCORES: Record<SourceTier, number> = {
  1: 95, // Government, Academic, Official Primary Source
  2: 80, // Major Tech Journalism, Verified Research Media
  3: 55, // Blogs, Communities, Social Networks
  4: 30, // Unverified, Unknown
};

export function determineSourceTier(sourceType: SourceType, domain?: string): SourceTier {
  if (sourceType === "GOVERNMENT" || sourceType === "OFFICIAL" || sourceType === "RESEARCH") {
    return 1;
  }
  if (sourceType === "NEWS" || sourceType === "COMPANY") {
    return 2;
  }
  if (sourceType === "COMMUNITY" || sourceType === "SOCIAL") {
    return 3;
  }
  return 4;
}

export function calculateSourceReliabilityScore(tier: SourceTier, hasPublishedDate: boolean): number {
  const base = SOURCE_TIER_SCORES[tier] || 50;
  return hasPublishedDate ? Math.min(100, base + 5) : base;
}

export function calculateFactCheckScore(claims: ArticleClaim[]): number {
  if (!claims || claims.length === 0) return 90; // Default when no critical claims identified

  let totalScore = 0;
  for (const claim of claims) {
    let claimScore = 50;
    if (claim.verification_status === "VERIFIED") claimScore = 100;
    else if (claim.verification_status === "PARTIALLY_VERIFIED") claimScore = 75;
    else if (claim.verification_status === "UNVERIFIED") claimScore = 30;
    else if (claim.verification_status === "CONFLICTING") claimScore = 10;

    // High risk categories require higher confidence
    if (claim.category === "PRICING" || claim.category === "STATISTICS" || claim.category === "LEGAL") {
      claimScore *= claim.confidence;
    }
    totalScore += claimScore;
  }

  return Math.round(totalScore / claims.length);
}
