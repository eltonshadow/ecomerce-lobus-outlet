import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Entrar | Painel LOBUS" };

// Já logado vai direto para o painel. Fica dentro de <Suspense> porque lê cookies.
async function RedirectIfLogged() {
  if (await getAdmin()) redirect("/admin");
  return null;
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Suspense fallback={null}>
        <RedirectIfLogged />
      </Suspense>
      <div className="w-full max-w-sm bg-surface-container p-8 rounded-lg shadow-lg">
        <img src="/logo.png" alt="LOBUS Outlet" className="h-20 w-auto mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-on-surface text-center mb-6">Painel administrativo</h1>
        <LoginForm />
      </div>
    </main>
  );
}
