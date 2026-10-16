"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, destroyCustomerSession, getCustomer } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isValidCpf } from "@/lib/cpf";
import { safeNext } from "@/lib/safe-next";

export type AccountState = { error?: string; values?: Record<string, string> } | undefined;

const DUMMY_HASH = hashPassword("dummy-password-for-timing");
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const digits = (s: string) => s.replace(/\D/g, "");


export async function registerCustomerAction(_: AccountState, fd: FormData): Promise<AccountState> {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const phone = digits(str(fd, "phone"));
  const cpf = digits(str(fd, "cpf"));
  const password = String(fd.get("password") ?? "");
  const values = { name, email, phone: str(fd, "phone"), cpf: str(fd, "cpf") };

  if (name.length < 3) return { error: "Informe seu nome completo.", values };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Informe um e-mail válido.", values };
  if (phone.length < 10 || phone.length > 13) return { error: "Informe um WhatsApp válido com DDD.", values };
  if (!isValidCpf(cpf)) return { error: "CPF inválido. Confira os números.", values };
  if (password.length < 8) return { error: "A senha precisa ter pelo menos 8 caracteres.", values };

  let id: string;
  try {
    const c = await prisma.customer.create({ data: { name, email, phone, cpf, passwordHash: hashPassword(password) } });
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

// Para componentes cliente (header, checkout): dados da própria conta ou null.
export async function getMeAction() {
  const c = await getCustomer();
  return c ? { name: c.name, email: c.email, phone: c.phone, cpf: c.cpf } : null;
}
