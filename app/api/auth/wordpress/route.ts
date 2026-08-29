import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const clientId = process.env.WP_CLIENT_ID || "146939";
  const url = new URL(req.url);
  const redirectUri = `${url.origin}/api/auth/wordpress/callback`;

  const authUrl = `https://public-api.wordpress.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=global`;

  return NextResponse.redirect(authUrl);
}
