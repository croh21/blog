import { NextResponse } from "next/server";
import { getClaims, saveClaim, deleteClaim, updateClaimStatus, getArticleById, saveArticle } from "@/lib/db";
import { calculateFactCheckScore } from "@/lib/scoring/reliability-scorer";
import { nanoid } from "nanoid";
import { ArticleClaim } from "@/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const claims = await getClaims(id);
  return NextResponse.json({ claims });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const newClaim: ArticleClaim = {
      id: body.id || nanoid(),
      article_id: id,
      claim: body.claim || "",
      source_name: body.source_name || "수동 검증",
      source_url: body.source_url || "",
      confidence: body.confidence || 0.9,
      verification_status: body.verification_status || "VERIFIED",
      category: body.category || "GENERAL",
      notes: body.notes || "",
    };

    await saveClaim(newClaim);
    const allClaims = await getClaims(id);

    // Update article fact check score
    const article = await getArticleById(id);
    if (article) {
      article.fact_check_score = calculateFactCheckScore(allClaims);
      await saveArticle(article);
    }

    return NextResponse.json({ success: true, claim: newClaim, claims: allClaims, factCheckScore: article?.fact_check_score });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Claim ID is required" }, { status: 400 });
    }

    await saveClaim({
      ...body,
      article_id: id,
    });
    const allClaims = await getClaims(id);

    const article = await getArticleById(id);
    if (article) {
      article.fact_check_score = calculateFactCheckScore(allClaims);
      await saveArticle(article);
    }

    return NextResponse.json({ success: true, claims: allClaims, factCheckScore: article?.fact_check_score });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const claimId = searchParams.get("claimId");
    if (!claimId) {
      return NextResponse.json({ error: "Claim ID is required" }, { status: 400 });
    }

    await deleteClaim(claimId);
    const allClaims = await getClaims(id);

    const article = await getArticleById(id);
    if (article) {
      article.fact_check_score = calculateFactCheckScore(allClaims);
      await saveArticle(article);
    }

    return NextResponse.json({ success: true, claims: allClaims, factCheckScore: article?.fact_check_score });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
