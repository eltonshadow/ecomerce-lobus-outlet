"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, destroyCustomerSession, getCustomer, requireCustomer } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isValidCpf } from "@/lib/cpf";
import { safeNext } from "@/lib/safe-next";
import { lookupCep, parseAddress, zoneForCep } from "@/lib/address";

export type AccountState = { error?: string; ok?: string; values?: Record<string, string> } | undefined;

const DUMMY_HASH = hashPassword("dummy-password-for-timing");
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const digits = (s: string) => s.replace(/\D/g, "");

// "AAAA-MM-DD" do <input type="date">. Vazio = não informado.
function parseBirth(raw: string): Date | null | "invalid" {
  if (!raw) return null;
  const d = new Date(`${raw}T00:00:00Z`);
  const age = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
  return Number.isNaN(d.getTime()) || age < 12 || age > 110 ? "invalid" : d;
}

function profileError(name: string, phone: string, birth: Date | null | "invalid") {
  if (name.length < 3) return "Informe seu nome completo.";
  if (phone.length < 10 || phone.length > 13) return "Informe um WhatsApp válido com DDD.";
  if (birth === "invalid") return "Data de nascimento inválida.";
  return null;
}

export async function registerCustomerAction(_: AccountState, fd: FormData): Promise<AccountState> {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const phone = digits(str(fd, "phone"));
  const cpf = digits(str(fd, "cpf"));
  const birth = parseBirth(str(fd, "birthDate"));
  const password = String(fd.get("password") ?? "");
  const values = Object.fromEntries([...fd.entries()].filter(([k, v]) => typeof v === "string" && !k.startsWith("password") && !k.startsWith("$")).map(([k, v]) => [k, String(v)]));

  const address = parseAddress(fd);
  const error =
    profileError(name, phone, birth) ??
    (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? "Informe um e-mail válido." : null) ??
    (!isValidCpf(cpf) ? "CPF inválido. Confira os números." : null) ??
    ("error" in address ? address.error : null) ??
    (password.length < 8 ? "A senha precisa ter pelo menos 8 caracteres." : null) ??
    (password !== String(fd.get("password2") ?? "") ? "As senhas não conferem." : null);
  if (error || "error" in address) return { error: error ?? "Endereço inválido.", values };

  let id: string;
  try {
    const c = await prisma.customer.create({
      data: { name, email, phone, cpf, birthDate: birth === "invalid" ? null : birth, passwordHash: hashPassword(password), addresses: { create: { ...address.data, isDefault: true } } },
    });
    id = c.id;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { error: "Já existe uma conta com este e-mail. Entre com sua senha.", values };
    }
    throw e;
  }
  await createCustomerSession(id);
  redirect(safeNext(str(fd, "next")));
}

export async function loginCustomerAction(_: AccountState, fd: FormData): Promise<AccountState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const c = email ? await prisma.customer.findUnique({ where: { email } }) : null;
  // Mesma mensagem e mesmo custo para conta inexistente, inativa ou senha errada.
  const ok = verifyPassword(password, c?.passwordHash ?? DUMMY_HASH);
  if (!c || !c.active || !ok) return { error: "E-mail ou senha inválidos.", values: { email } };
  await createCustomerSession(c.id);
  redirect(safeNext(str(fd, "next")));
}

export async function logoutCustomerAction() {
  await destroyCustomerSession();
  redirect("/");
}

// Para componentes cliente (header, checkout): dados da própria conta e endereços, ou null.
export async function getMeAction() {
  const c = await getCustomer();
  if (!c) return null;
  const addresses = await prisma.customerAddress.findMany({ where: { customerId: c.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
  return {
    name: c.name,
    email: c.email,
    phone: c.phone,
    cpf: c.cpf,
    addresses: addresses.map(({ id, label, cep, street, number, complement, neighborhood, reference }) => ({ id, label, cep, street, number, complement, neighborhood, reference })),
  };
}

// CEP digitado: endereço do ViaCEP (pode vir null) e zona/taxa do motoboy.
export async function lookupCepAction(cep: string) {
  const [address, zone] = await Promise.all([lookupCep(cep), zoneForCep(cep)]);
  return { address, zone };
}

export async function saveAddressAction(_: AccountState, fd: FormData): Promise<AccountState> {
  const me = await requireCustomer();
  const parsed = parseAddress(fd);
  if ("error" in parsed) return { error: parsed.error };
  const id = str(fd, "id");
  const count = await prisma.customerAddress.count({ where: { customerId: me.id } });
  const isDefault = fd.get("isDefault") === "on" || count === 0;
  await prisma.$transaction(async (tx) => {
    if (isDefault) await tx.customerAddress.updateMany({ where: { customerId: me.id }, data: { isDefault: false } });
    // updateMany com customerId: endereço de outra conta não é alterado.
    if (id) await tx.customerAddress.updateMany({ where: { id, customerId: me.id }, data: { ...parsed.data, ...(isDefault ? { isDefault } : {}) } });
    else await tx.customerAddress.create({ data: { ...parsed.data, isDefault, customerId: me.id } });
  });
  revalidatePath("/conta");
  return { ok: "Endereço salvo." };
}

export async function deleteAddressAction(id: string) {
  const me = await requireCustomer();
  await prisma.$transaction(async (tx) => {
    const del = await tx.customerAddress.deleteMany({ where: { id, customerId: me.id } });
    if (!del.count) return;
    const hasDefault = await tx.customerAddress.count({ where: { customerId: me.id, isDefault: true } });
    const first = hasDefault ? null : await tx.customerAddress.findFirst({ where: { customerId: me.id }, orderBy: { createdAt: "asc" } });
    if (first) await tx.customerAddress.update({ where: { id: first.id }, data: { isDefault: true } });
  });
  revalidatePath("/conta");
}

export async function setDefaultAddressAction(id: string) {
  const me = await requireCustomer();
  await prisma.$transaction([
    prisma.customerAddress.updateMany({ where: { customerId: me.id }, data: { isDefault: false } }),
    prisma.customerAddress.updateMany({ where: { id, customerId: me.id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/conta");
}

export async function updateProfileAction(_: AccountState, fd: FormData): Promise<AccountState> {
  const me = await requireCustomer();
  const name = str(fd, "name");
  const phone = digits(str(fd, "phone"));
  const birth = parseBirth(str(fd, "birthDate"));
  const error = profileError(name, phone, birth);
  if (error) return { error };
  await prisma.customer.update({ where: { id: me.id }, data: { name, phone, birthDate: birth === "invalid" ? null : birth } });
  revalidatePath("/conta");
  return { ok: "Dados atualizados." };
}

export async function changePasswordAction(_: AccountState, fd: FormData): Promise<AccountState> {
  const me = await requireCustomer();
  const c = await prisma.customer.findUnique({ where: { id: me.id } });
  const next = String(fd.get("newPassword") ?? "");
  if (!c || !verifyPassword(String(fd.get("currentPassword") ?? ""), c.passwordHash)) return { error: "Senha atual incorreta." };
  if (next.length < 8) return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
  await prisma.customer.update({ where: { id: me.id }, data: { passwordHash: hashPassword(next) } });
  return { ok: "Senha trocada." };
}
