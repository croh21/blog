import { NextResponse } from "next/server";
import { updateSettings } from "@/lib/db";
import fs from "fs";
import path from "path";


export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/settings?wp_auth=failed&error=${encodeURIComponent(error || "No code provided")}`);
  }

  const clientId = process.env.WP_CLIENT_ID || "146939";
  const clientSecret = process.env.WP_CLIENT_SECRET || "LEKOMLEUXY1DBetDzpxmq7Ujni6urD4XvgTiC8yATSciqFfubvWoY3yjvmcQ4rYy";
  const redirectUri = `${origin}/api/auth/wordpress/callback`;

  try {
    const tokenRes = await fetch("https://public-api.wordpress.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      console.error("WordPress OAuth Token Error:", tokenData);
      return NextResponse.redirect(
        `${origin}/settings?wp_auth=failed&error=${encodeURIComponent(tokenData.error_description || tokenData.error || "Token exchange failed")}`
      );
    }

    const accessToken = tokenData.access_token;
    const blogId = tokenData.blog_id || "hanabird2.wordpress.com";
    const blogUrl = tokenData.blog_url || "https://hanabird2.wordpress.com";

    // 1. Save to DB settings
    await updateSettings("wordpress", {
      siteId: blogId.toString(),
      token: accessToken,
    });


    // 2. Also update local .env file if available
    try {
      const envPath = path.join(process.cwd(), ".env");
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, "utf-8");
        envContent = envContent.replace(/WP_ACCESS_TOKEN=.*/g, `WP_ACCESS_TOKEN=${accessToken}`);
        envContent = envContent.replace(/WP_SITE_ID=.*/g, `WP_SITE_ID=${blogId}`);
        if (!envContent.includes("WP_ACCESS_TOKEN=")) {
          envContent += `\nWP_ACCESS_TOKEN=${accessToken}`;
        }
        if (!envContent.includes("WP_SITE_ID=")) {
          envContent += `\nWP_SITE_ID=${blogId}`;
        }
        fs.writeFileSync(envPath, envContent, "utf-8");
      }
    } catch (e) {
      console.warn("Could not write to .env file:", e);
    }

    process.env.WP_ACCESS_TOKEN = accessToken;
    process.env.WP_SITE_ID = blogId.toString();

    return NextResponse.redirect(`${origin}/settings?wp_auth=success&site=${encodeURIComponent(blogUrl)}`);
  } catch (err: any) {
    console.error("WordPress callback exception:", err);
    return NextResponse.redirect(`${origin}/settings?wp_auth=failed&error=${encodeURIComponent(err.message || "Unknown error")}`);
  }
}
