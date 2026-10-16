"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type AdminRole, type OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { changeOrderStatus, CheckoutError } from "@/lib/orders";

// Toda action deste arquivo é um POST público: cada uma chama requireAdmin(roles) por conta própria.

export type ActionState = { error?: string; ok?: string } | undefined;

const ROLES: AdminRole[] = ["ADMIN", "EXPEDICAO", "ATENDIMENTO"];
const STATUSES: OrderStatus[] = ["PENDING", "PAID", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];
const UUID = /^[0-9a-f-]{36}$/i;

const DUMMY_HASH = hashPassword("dummy-password-for-timing");

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function money(v: string, field: string, optional = false): number | null {
  if (!v) {
    if (optional) return null;
    throw new CheckoutError(`${field}: obrigatório.`);
  }
  const n = Number(v.replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > 1_000_000) throw new CheckoutError(`${field}: valor inválido.`);
  return Math.round(n * 100) / 100;
}

function int(v: string, field: string, optional = false): number | null {
  if (!v) {
    if (optional) return null;
    throw new CheckoutError(`${field}: obrigatório.`);
  }
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 1_000_000) throw new CheckoutError(`${field}: número inteiro inválido.`);
  return n;
}

function id(v: string) {
  if (!UUID.test(v)) throw new CheckoutError("Identificador inválido.");
  return v;
}

// Converte erros esperados em mensagem; erro de unicidade do Prisma vira texto legível.
async function run(fn: () => Promise<string | void>): Promise<ActionState> {
  try {
    const ok = await fn();
    refresh();
    return { ok: ok || "Salvo." };
  } catch (e) {
    if (e instanceof CheckoutError) return { error: e.message };
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { error: "Já existe um registro com esse valor (slug, SKU, código ou e-mail)." };
    console.error("Erro no admin:", e);
    return { error: "Erro inesperado. Tente novamente." };
  }
}

// ---------- Sessão ----------

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const user = email ? await prisma.adminUser.findUnique({ where: { email } }) : null;
  // Mesma mensagem e mesmo custo (scrypt roda sempre) para usuário inexistente, inativo ou senha errada.
  const ok = verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !user.active || !ok) return { error: "E-mail ou senha inválidos." };
  await createSession(user.id);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ---------- Pedidos ----------

export async function changeOrderStatusAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin(["ADMIN", "EXPEDICAO"]);
  return run(async () => {
    const to = str(fd, "status") as OrderStatus;
    if (!STATUSES.includes(to)) throw new CheckoutError("Status inválido.");
    await changeOrderStatus(id(str(fd, "orderId")), to);
    return "Status atualizado.";
  });
}

// ---------- Produtos ----------

export async function updateProductAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin(["ADMIN", "EXPEDICAO"]);
  return run(async () => {
    const productId = id(str(fd, "productId"));
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          price: money(str(fd, "price"), "Preço")!,
          originalPrice: money(str(fd, "originalPrice"), "Preço de", true),
          active: fd.get("active") === "on",
        },
      });
      // Campos stock_<variantId> vindos do formulário; só aceita variants deste produto.
      for (const [k, v] of fd.entries()) {
        if (!k.startsWith("stock_")) continue;
        await tx.productVariant.updateMany({
          where: { id: id(k.slice(6)), productId },
          data: { stockQuantity: int(String(v), "Estoque")! },
        });
      }
    });
    return "Produto atualizado.";
  });
}

export async function createProductAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin(["ADMIN"]);
  return run(async () => {
    const name = str(fd, "name");
    const slug = str(fd, "slug").toLowerCase();
    if (name.length < 3) throw new CheckoutError("Nome muito curto.");
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new CheckoutError("Slug: use letras minúsculas, números e hífen.");
    const categoryId = id(str(fd, "categoryId"));
    const imageUrl = str(fd, "imageUrl");
    if (imageUrl && !/^https:\/\/\S+$/.test(imageUrl)) throw new CheckoutError("URL da imagem deve começar com https://");

    // Variants em texto, uma por linha: TAMANHO;SKU;ESTOQUE
    const variants = str(fd, "variants")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [size, sku, stock] = l.split(";").map((x) => x?.trim() ?? "");
        if (!size || !sku) throw new CheckoutError(`Variant inválida: "${l}". Formato: TAMANHO;SKU;ESTOQUE`);
        return { size, sku: sku.toUpperCase(), stockQuantity: int(stock || "0", "Estoque")! };
      });
    if (!variants.length) throw new CheckoutError("Informe ao menos uma variant.");

    await prisma.product.create({
      data: {
        name,
        slug,
        categoryId,
        description: str(fd, "description") || null,
        price: money(str(fd, "price"), "Preço")!,
        originalPrice: money(str(fd, "originalPrice"), "Preço de", true),
        isOutletDiscount: !!str(fd, "originalPrice"),
        images: imageUrl ? { create: [{ imageUrl, isMain: true, altText: name }] } : undefined,
        variants: { create: variants },
      },
    });
    return "Produto criado.";
  });
}

// ---------- Cupons ----------

export async function createCouponAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin(["ADMIN"]);
  return run(async () => {
    const code = str(fd, "code").toUpperCase();
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) throw new CheckoutError("Código: 3 a 30 letras, números, _ ou -.");
    const discountType = str(fd, "discountType");
    if (discountType !== "PERCENTAGE" && discountType !== "FIXED_AMOUNT") throw new CheckoutError("Tipo de desconto inválido.");
    const discountValue = money(str(fd, "discountValue"), "Valor")!;
    if (discountValue <= 0 || (discountType === "PERCENTAGE" && discountValue > 100)) throw new CheckoutError("Valor do desconto inválido.");
    const validUntilRaw = str(fd, "validUntil");
    const validUntil = validUntilRaw ? new Date(`${validUntilRaw}T23:59:59-03:00`) : null;
    if (validUntil && Number.isNaN(validUntil.getTime())) throw new CheckoutError("Validade inválida.");

    await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue,
        minOrderValue: money(str(fd, "minOrderValue"), "Pedido mínimo", true),
        maxUses: int(str(fd, "maxUses"), "Máximo de usos", true),
        validUntil,
      },
    });
    return "Cupom criado.";
  });
}

export async function toggleCouponAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin(["ADMIN"]);
  return run(async () => {
    const c = await prisma.coupon.findUnique({ where: { id: id(str(fd, "couponId")) } });
    if (!c) throw new CheckoutError("Cupom não encontrado.");
    await prisma.coupon.update({ where: { id: c.id }, data: { active: !c.active } });
    return c.active ? "Cupom desativado." : "Cupom ativado.";
  });
}

// ---------- Usuários ----------

export async function createUserAction(_: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin(["ADMIN"]);
  return run(async () => {
    const name = str(fd, "name");
    const email = str(fd, "email").toLowerCase();
    const password = String(fd.get("password") ?? "");
    const role = str(fd, "role") as AdminRole;
    if (name.length < 2) throw new CheckoutError("Nome muito curto.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new CheckoutError("E-mail inválido.");
    if (password.length < 8) throw new CheckoutError("Senha precisa de ao menos 8 caracteres.");
    if (!ROLES.includes(role)) throw new CheckoutError("Perfil inválido.");
    await prisma.adminUser.create({ data: { name, email, role, passwordHash: hashPassword(password) } });
    return "Usuário criado.";
  });
}

export async function toggleUserAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin(["ADMIN"]);
  return run(async () => {
    const userId = id(str(fd, "userId"));
    if (userId === me.id) throw new CheckoutError("Você não pode desativar a si mesmo.");
    const u = await prisma.adminUser.findUnique({ where: { id: userId } });
    if (!u) throw new CheckoutError("Usuário não encontrado.");
    await prisma.adminUser.update({ where: { id: u.id }, data: { active: !u.active } });
    return u.active ? "Usuário desativado." : "Usuário ativado.";
  });
}
