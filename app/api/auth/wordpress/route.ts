import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const clientId = "146939";
  const url = new URL(req.url);
  // Support both callback and settings as redirect
  const redirectUri = `${url.origin}/api/auth/wordpress/callback`;

  const authUrl = `https://public-api.wordpress.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=global`;

  return NextResponse.redirect(authUrl);
}

