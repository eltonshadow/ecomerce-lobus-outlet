import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "maua_admin";
export const CUSTOMER_COOKIE = "maua_cliente";
const CUSTOMER_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
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
// k separa admin ("a") de cliente ("c"): token de cliente nunca vale como sessão de admin.
type SessionKind = "a" | "c";
type SessionData = { uid: string; exp: number; k: SessionKind };

export function encodeSession(data: SessionData) {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined, kind: SessionKind): SessionData | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const got = Buffer.from(sig);
  if (expected.length !== got.length || !timingSafeEqual(expected, got)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.uid !== "string" || typeof data.exp !== "number" || data.exp < Date.now() || data.k !== kind) return null;
    return data;
  } catch {
    return null;
  }
}

async function setSessionCookie(name: string, uid: string, k: SessionKind, ttl: number) {
  const exp = Date.now() + ttl;
  (await cookies()).set(name, encodeSession({ uid, exp, k }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "1",
    path: "/",
    expires: new Date(exp),
  });
}

export async function createSession(uid: string) {
  await setSessionCookie(SESSION_COOKIE, uid, "a", SESSION_TTL_MS);
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function createCustomerSession(uid: string) {
  await setSessionCookie(CUSTOMER_COOKIE, uid, "c", CUSTOMER_TTL_MS);
}

export async function destroyCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export type CustomerSession = { id: string; name: string; email: string; phone: string; cpf: string };

// DAL do cliente: relê no banco a cada chamada (conta desativada derruba a sessão).
export async function getCustomer(): Promise<CustomerSession | null> {
  const data = decodeSession((await cookies()).get(CUSTOMER_COOKIE)?.value, "c");
  if (!data) return null;
  const c = await prisma.customer.findUnique({ where: { id: data.uid } });
  if (!c || !c.active) return null;
  return { id: c.id, name: c.name, email: c.email, phone: c.phone, cpf: c.cpf };
}

export async function requireCustomer(next = "/conta"): Promise<CustomerSession> {
  const c = await getCustomer();
  if (!c) redirect(`/conta/entrar?next=${encodeURIComponent(next)}`);
  return c;
}

export type AdminSession = { id: string; name: string; email: string; role: AdminRole };

// Data Access Layer: toda página e server action do admin passa por aqui.
// Relê o usuário no banco a cada chamada, então desativar o usuário derruba a sessão.
export async function getAdmin(): Promise<AdminSession | null> {
  const data = decodeSession((await cookies()).get(SESSION_COOKIE)?.value, "a");
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
