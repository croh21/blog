import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { siteId, token } = await req.json();

    const targetSiteId = siteId || process.env.WP_SITE_ID;
    const targetToken = token || process.env.WP_ACCESS_TOKEN;

    if (!targetSiteId || !targetToken) {
      return NextResponse.json({
        success: false,
        error: "워드프레스 사이트 ID(WP_SITE_ID) 또는 액세스 토큰(WP_ACCESS_TOKEN)이 비어 있습니다.",
      });
    }

    // 워드프레스 REST API 연결 테스트 (사이트 정보 조회)
    const res = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${targetSiteId}`, {
      headers: {
        Authorization: `Bearer ${targetToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return NextResponse.json({
        success: false,
        error: data.message || data.error || `HTTP ${res.status} 오류`,
      });
    }

    return NextResponse.json({
      success: true,
      siteName: data.name,
      siteUrl: data.URL,
      siteId: data.ID,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || "워드프레스 서버와 통신할 수 없습니다.",
    });
  }
}
