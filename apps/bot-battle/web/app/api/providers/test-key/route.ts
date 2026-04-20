import { NextRequest, NextResponse } from "next/server";
import { PROVIDER_VERIFICATION } from "../../../core/provider-verification-endpoints";

export async function POST(req: NextRequest) {
  const { provider, key } = await req.json();
  if (!provider || !key) {
    return NextResponse.json({ ok: false, error: "Missing provider or key" }, { status: 400 });
  }
  const spec = PROVIDER_VERIFICATION[provider];
  if (!spec) {
    return NextResponse.json({ ok: false, error: `Unknown provider: ${provider}` });
  }

  const url = provider === "google" ? `${spec.url}?key=${encodeURIComponent(key)}` : spec.url;
  try {
    const resp = await fetch(url, { method: spec.method, headers: spec.authHeader(key) });
    if (resp.ok) return NextResponse.json({ ok: true });
    const body = await resp.text().catch(() => "");
    return NextResponse.json({
      ok: false,
      error: `${resp.status}: ${body.slice(0, 200) || resp.statusText}`,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "network error" });
  }
}
