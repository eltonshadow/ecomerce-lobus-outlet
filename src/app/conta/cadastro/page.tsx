import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";
import { SiteHeader } from "@/components/SiteHeader";
import { ui } from "@/design/ui";
import { RegisterForm } from "../AuthForms";

type Props = { searchParams: Promise<{ next?: string }> };

export const metadata = { title: "Criar conta | Tropa da Mauá" };

export default function CadastroPage({ searchParams }: Props) {
  return (
    <>
      <SiteHeader />
      <main className={`${ui.container} flex-1 py-16`}>
        <div className="max-w-md mx-auto flex flex-col gap-6">
          <p className={ui.eyebrow}>Minha conta</p>
          <h1 className={ui.pageTitle}>Criar conta</h1>
          <p className="text-muted">Com a conta, seus dados já vêm preenchidos no checkout e todos os seus pedidos ficam num lugar só.</p>
          <Suspense fallback={<p className="text-muted">Carregando...</p>}>
            <Gate searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </>
  );
}

async function Gate({ searchParams }: Props) {
  const { next } = await searchParams;
  const target = safeNext(next);
  if (await getCustomer()) redirect(target);
  return <RegisterForm next={target} />;
}
