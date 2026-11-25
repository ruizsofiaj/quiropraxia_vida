import { NextResponse } from "next/server";
import { IS_DEMO } from "@/lib/demo";
import { isRubro, RUBRO_COOKIE } from "@/lib/profile";

// Solo existe en la demo: guarda el rubro elegido en una cookie y vuelve al inicio.
export async function GET(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const res = NextResponse.redirect(new URL("/", req.url));
  if (IS_DEMO && isRubro(key)) {
    res.cookies.set(RUBRO_COOKIE, key, { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  }
  return res;
}
