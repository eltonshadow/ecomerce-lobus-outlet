"use server";

import { prisma } from "@/lib/prisma";

export async function getStoreProducts(filter?: { categorySlug?: string; size?: string }) {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(filter?.categorySlug && filter.categorySlug !== "todas"
          ? { category: { slug: filter.categorySlug } }
          : {}),
        ...(filter?.size && filter.size !== "todos"
          ? {
              variants: {
                some: {
                  size: { contains: filter.size },
                  stockQuantity: { gt: 0 },
                },
              },
            }
          : {}),
      },
      include: {
        category: true,
        images: {
          orderBy: { displayOrder: "asc" },
        },
        variants: {
          orderBy: { size: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category.name,
        description: p.description || "",
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        price: Number(p.price),
        isOutletDiscount: p.isOutletDiscount,
        featured: p.featured,
        images: p.images.map((img) => img.imageUrl),
        variants: p.variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          colorName: v.colorName || undefined,
          colorHex: v.colorHex || undefined,
          stockQuantity: v.stockQuantity,
        })),
        measurementsGuide: p.measurementsGuide as any,
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar produtos do banco:", error);
    return { success: false, data: [] };
  }
}

export async function getDeliveryZonesFromDB() {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { active: true },
      orderBy: { deliveryFee: "asc" },
    });
    return { success: true, data: zones };
  } catch (error) {
    console.error("Erro ao buscar zonas de frete:", error);
    return { success: false, data: [] };
  }
}

export async function createOrderInDB(orderInput: {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerCpf: string;
  deliveryMethod: "PICKUP" | "MOTOBOY";
  deliveryFee: number;
  deliveryZoneName?: string;
  shippingAddress?: string;
  items: {
    variantId: string;
    quantity: number;
    unitPrice: number;
  }[];
}) {
  try {
    const orderNumber = `LOB-${Math.floor(1000 + Math.random() * 9000)}`;
    const subtotal = orderInput.items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    const total = subtotal + orderInput.deliveryFee;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Cria o pedido
      const order = await tx.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          customerName: orderInput.customerName,
          customerPhone: orderInput.customerPhone,
          customerEmail: orderInput.customerEmail || "cliente@lobosg.com.br",
          customerCpf: orderInput.customerCpf || "000.000.000-00",
          deliveryMethod: orderInput.deliveryMethod,
          deliveryFee: orderInput.deliveryFee,
          deliveryZoneName: orderInput.deliveryZoneName,
          deliveryNotes: orderInput.shippingAddress,
          subtotal,
          total,
          paymentMethod: "PIX",
          paymentStatus: "PENDING",
          pixCopyPaste: `00020126580014br.gov.bcb.pix0136${orderNumber}520400005303986540${total.toFixed(2)}5802BR5915LOBOS G OUTLET6007GOIANIA62070503***6304E8A9`,
          pixExpiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 min
        },
      });

      // 2. Cria os itens e abate do estoque
      for (const item of orderInput.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });

        if (!variant) continue;

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            variantId: variant.id,
            productName: variant.product.name,
            sku: variant.sku,
            size: variant.size,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          },
        });

        // Abate estoque
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return { success: true, order: result };
  } catch (error) {
    console.error("Erro ao criar pedido no banco:", error);
    return { success: false, error: "Falha ao gravar pedido." };
  }
}
