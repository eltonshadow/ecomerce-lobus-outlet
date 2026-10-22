"use client";

import { useState } from "react";
import { lookupCepAction } from "@/actions/account";
import { ui, brl } from "@/design/ui";

type Zone = Awaited<ReturnType<typeof lookupCepAction>>["zone"];
export type AddressValues = Partial<Record<"label" | "cep" | "street" | "number" | "complement" | "neighborhood" | "city" | "state" | "reference", string | null>>;

const maskCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};

export function Field({ id, label, hint, className = "", ...rest }: { id: string; label: string; hint?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label htmlFor={id} className={`flex flex-col gap-1.5 min-w-0 ${className}`}>
      <span className="font-body text-label-sm uppercase text-muted">{label}</span>
      <input id={id} className={ui.input} {...rest} name={rest.name ?? id} />
      {hint && <span className="text-body-sm text-muted">{hint}</span>}
    </label>
  );
}

// Campos de endereço: o CEP preenche rua, bairro e cidade (ViaCEP) e mostra a zona do motoboy.
// Tudo continua editável: se o ViaCEP falhar, o cliente digita.
export function AddressFields({ initial = {}, prefix = "" }: { initial?: AddressValues; prefix?: string }) {
  const [v, setV] = useState<AddressValues>({ ...initial, cep: initial.cep ? maskCep(initial.cep) : "" });
  const [zone, setZone] = useState<Zone | undefined>(undefined);
  const [cepMsg, setCepMsg] = useState("");
  const set = (k: keyof AddressValues) => (e: React.ChangeEvent<HTMLInputElement>) => setV((x) => ({ ...x, [k]: e.target.value }));
  const id = (k: string) => `${prefix}${k}`;

  const onCep = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = maskCep(e.target.value);
    setV((x) => ({ ...x, cep }));
    if (cep.length !== 9) return setZone(undefined);
    setCepMsg("Buscando endereço...");
    const r = await lookupCepAction(cep);
    if (r.address) setV((x) => ({ ...x, street: r.address!.street || x.street, neighborhood: r.address!.neighborhood || x.neighborhood, city: r.address!.city, state: r.address!.state }));
    setCepMsg(r.address ? "Endereço encontrado" : "Não achamos o CEP. Preencha o endereço abaixo.");
    setZone(r.zone);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-3">
      <Field id={id("cep")} name="cep" label="CEP" required inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" value={v.cep ?? ""} onChange={onCep} className="col-span-2 sm:col-span-1" hint={cepMsg || undefined} />
      <Field id={id("street")} name="street" label="Rua" required autoComplete="address-line1" value={v.street ?? ""} onChange={set("street")} className="col-span-2" />
      <Field id={id("number")} name="number" label="Número" required value={v.number ?? ""} onChange={set("number")} />
      <Field id={id("complement")} name="complement" label="Complemento · opcional" value={v.complement ?? ""} onChange={set("complement")} />
      <Field id={id("neighborhood")} name="neighborhood" label="Bairro" required value={v.neighborhood ?? ""} onChange={set("neighborhood")} className="col-span-2 sm:col-span-1" />
      <Field id={id("city")} name="city" label="Cidade" required value={v.city ?? ""} onChange={set("city")} />
      <Field id={id("state")} name="state" label="UF" required maxLength={2} value={v.state ?? ""} onChange={set("state")} />
      <Field id={id("reference")} name="reference" label="Ponto de referência · opcional" value={v.reference ?? ""} onChange={set("reference")} className="col-span-2" />
      <Field id={id("label")} name="label" label="Apelido" placeholder="Casa, Trabalho..." value={v.label ?? ""} onChange={set("label")} className="col-span-2 sm:col-span-1" />
      {zone !== undefined && <ZoneBox zone={zone} />}
    </div>
  );
}

function ZoneBox({ zone }: { zone: Zone }) {
  return (
    <div className="col-span-2 sm:col-span-3 flex items-center justify-between gap-4 border border-gold px-4 py-3" aria-live="polite">
      {zone ? (
        <>
          <span>
            <span className="block font-body text-label-sm uppercase text-muted">Motoboy</span>
            <b className="font-display text-[20px] uppercase leading-tight">{zone.name}</b>
          </span>
          <span className="text-right whitespace-nowrap">
            <b className="block font-display text-[20px] text-gold tabular-nums">{brl(zone.fee)}</b>
            {zone.freeAbove !== null && <span className="text-body-sm text-muted">grátis acima de {brl(zone.freeAbove)}</span>}
          </span>
        </>
      ) : (
        <span className="text-body-sm text-muted">Fora da área do motoboy. Você ainda pode retirar na loja.</span>
      )}
    </div>
  );
}
