import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";
import { SiteHeader } from "@/components/SiteHeader";
import { ui } from "@/design/ui";
import { LoginForm } from "../AuthForms";

type Props = { searchParams: Promise<{ next?: string }> };

export const metadata = { title: "Entrar | LOBUS Outlet" };

export default function EntrarPage({ searchParams }: Props) {
  return (
    <>
      <SiteHeader />
      <main className={`${ui.container} flex-1 py-16`}>
        <div className="max-w-md mx-auto flex flex-col gap-6">
          <p className={ui.eyebrow}>Minha conta</p>
          <h1 className={ui.pageTitle}>Entrar</h1>
          <Suspense fallback={<p className="text-muted">Carregando...</p>}>
            <Gate searchParams={searchParams} />
          </Suspense>
          <p className="text-body-sm text-muted border-t border-line pt-6">
            Comprou sem conta?{" "}
            <Link href="/pedido" className="text-gold underline">
              Acompanhe pelo número do pedido
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

async function Gate({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = safeNext(next);
  if (await getCustomer()) redirect(target);
  return <LoginForm next={target} />;
}
