import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";
import { SiteHeader } from "@/components/SiteHeader";
import { ui } from "@/design/ui";
import { RegisterForm } from "../AuthForms";

type Props = { searchParams: Promise<{ next?: string }> };

export const metadata = { title: "Criar conta | Tropa da Mauá" };

const WHY = [
  ["Checkout em um toque", "Nome, CPF, WhatsApp e endereço já preenchidos."],
  ["Mais de um endereço", "Casa, trabalho, a casa da mãe. A taxa sai pelo CEP."],
  ["Pedidos num lugar só", "Acompanhe do pagamento até a entrega."],
];

export default function CadastroPage({ searchParams }: Props) {
  return (
    <>
      <SiteHeader />
      <main className={`${ui.container} flex-1 py-10 lg:py-12 grid gap-10 lg:grid-cols-[400px_1fr] lg:gap-16`}>
        <div className="flex flex-col gap-5">
          <p className={ui.eyebrow}>Minha conta</p>
          <h1 className="font-display uppercase text-[clamp(3.5rem,8vw,7rem)] leading-[0.86]">
            Criar <span className="text-gold">conta</span>
          </h1>
          <p className="text-muted max-w-sm">Cadastro feito uma vez. No próximo pedido é só escolher o endereço e pagar.</p>
          <ol className="hidden lg:block border-t border-line">
            {WHY.map(([t, d], i) => (
              <li key={t} className="grid grid-cols-[40px_1fr] gap-2 py-3 border-b border-line">
                <span className="font-mono text-[13px] text-gold">0{i + 1}</span>
                <span>
                  <b className="block font-semibold">{t}</b>
                  <small className="text-body-sm text-muted">{d}</small>
                </span>
              </li>
            ))}
          </ol>
          <p className="hidden lg:block text-body-sm text-muted">
            Já tem conta?{" "}
            <Link href="/conta/entrar" className={ui.linkUnderline}>
              Entrar
            </Link>
          </p>
        </div>
        <Suspense fallback={<p className="text-muted">Carregando...</p>}>
          <Gate searchParams={searchParams} />
        </Suspense>
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
