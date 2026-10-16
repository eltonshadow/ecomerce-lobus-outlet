import { NextResponse, type NextRequest } from "next/server";

// Checagem otimista: só olha se o cookie existe. A validação real (assinatura, usuário ativo, role)
// fica no DAL (requireAdmin) em cada página e server action.
const SESSION_COOKIE = "lobus_admin"; // mesmo nome de src/lib/auth.ts

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/admin/login" && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
