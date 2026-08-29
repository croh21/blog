import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Return an interactive HTML helper that parses the #access_token=... hash fragment from WordPress OAuth
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>WordPress OAuth 연동 중...</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; text-align: center; }
    .card { background: #1e293b; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 400px; }
    .spinner { border: 3px solid rgba(255,255,255,0.1); border-top: 3px solid #3b82f6; border-radius: 50%; width: 36px; height: 36px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h3>워드프레스 계정 연동 처리 중...</h3>
    <p style="font-size: 13px; color: #94a3b8;">토큰을 안전하게 등록하고 있습니다.</p>
  </div>
  <script>
    (async function() {
      try {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        let blogId = params.get('site_id') || params.get('blog_id') || 'hanabird2.wordpress.com';
        if (!blogId || blogId === '0') {
          blogId = 'hanabird2.wordpress.com';
        }


        if (accessToken) {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wordpress: {
                siteId: blogId,
                token: accessToken
              }
            })
          });
          window.location.href = '/settings?wp_auth=success';
        } else {
          // Check query params if code
          const queryParams = new URLSearchParams(window.location.search);
          const error = queryParams.get('error');
          if (error) {
            window.location.href = '/settings?wp_auth=failed&error=' + encodeURIComponent(error);
          } else {
            window.location.href = '/settings';
          }
        }
      } catch (e) {
        window.location.href = '/settings?wp_auth=failed&error=' + encodeURIComponent(e.message);
      }
    })();
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
