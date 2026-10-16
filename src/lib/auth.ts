import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "lobus_admin";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8h

function secret() {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s || s.length < 16) throw new Error("NEXTAUTH_SECRET ausente ou curto demais (min 16 chars)");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

// Token = base64url(json).assinatura. Sem lib externa: HMAC-SHA256 com NEXTAUTH_SECRET.
export function encodeSession(data: { uid: string; exp: number }) {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): { uid: string; exp: number } | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.uid !== "string" || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createSession(uid: string) {
  const exp = Date.now() + SESSION_TTL_MS;
  (await cookies()).set(SESSION_COOKIE, encodeSession({ uid, exp }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "1",
    path: "/",
    expires: new Date(exp),
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export type AdminSession = { id: string; name: string; email: string; role: AdminRole };

// Data Access Layer: toda página e server action do admin passa por aqui.
// Relê o usuário no banco a cada chamada, então desativar o usuário derruba a sessão.
export async function getAdmin(): Promise<AdminSession | null> {
  const data = decodeSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!data) return null;
  const user = await prisma.adminUser.findUnique({ where: { id: data.uid } });
  if (!user || !user.active) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requireAdmin(roles?: AdminRole[]): Promise<AdminSession> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  if (roles && !roles.includes(admin.role)) redirect("/admin?erro=permissao");
  return admin;
}
