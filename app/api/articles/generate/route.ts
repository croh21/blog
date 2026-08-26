import { NextResponse } from "next/server";
import { getTopicById, getTopics } from "@/lib/db";
import { runFullArticlePipeline } from "@/lib/ai/pipeline";

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    let topicId = body?.topicId;
    let topic = topicId ? await getTopicById(topicId) : undefined;

    if (!topic) {
      const allTopics = await getTopics();
      topic = allTopics[0];
    }

    if (!topic) {
      return NextResponse.json({ success: false, error: "No topic available to generate article" }, { status: 400 });
    }

    const article = await runFullArticlePipeline(topic);
    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error("Article generation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
