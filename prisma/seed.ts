import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Populando banco de dados completo da Lobos G Outlet...");

  // 1. Ponto de Retirada Física
  await prisma.pickupPoint.upsert({
    where: { id: "loja-jardim-novo-mundo" },
    update: {},
    create: {
      id: "loja-jardim-novo-mundo",
      name: "Loja Física - Lobos G Outlet",
      address: "Jardim Novo Mundo, Goiânia - GO (Próximo à Praça Principal)",
      openingHours: "Segunda a Sexta: 09:00 às 19:00 | Sábado: 09:00 às 16:00",
      instructions: "Apresente o número do pedido ou seu WhatsApp no balcão de retirada.",
      active: true,
    },
  });

  // 2. Zonas de Entrega por Motoboy
  const zones = [
    {
      id: "zone-leste-novo-mundo",
      name: "Região Leste / Jardim Novo Mundo e Adjacências",
      cepPrefixes: ["74703", "74705", "74710", "74713", "74715", "74605", "74610"],
      neighborhoods: ["Jardim Novo Mundo", "Vila Morais", "Riviera", "Universitário"],
      deliveryFee: 10.00,
      estimatedDeliveryHours: 12,
      freeShippingAbove: 199.00,
      active: true,
    },
    {
      id: "zone-goiania-central",
      name: "Goiânia Central, Sul e Oeste",
      cepPrefixes: ["74000", "74100", "74200", "74800", "74110", "74150", "74215"],
      neighborhoods: ["Centro", "Setor Bueno", "Marista", "Setor Oeste", "Jardim Goiás"],
      deliveryFee: 16.00,
      estimatedDeliveryHours: 24,
      freeShippingAbove: 249.00,
      active: true,
    },
    {
      id: "zone-aparecida-demais",
      name: "Demais Bairros de Goiânia & Aparecida de Goiânia",
      cepPrefixes: ["74300", "74400", "74500", "74900"],
      neighborhoods: ["Norte Ferroviário", "Urias Magalhães", "Garavelo", "Buriti Sereno"],
      deliveryFee: 22.00,
      estimatedDeliveryHours: 36,
      freeShippingAbove: 299.00,
      active: true,
    },
  ];

  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: { id: zone.id },
      update: zone,
      create: zone,
    });
  }

  // 3. Categorias Principais
  const categories = [
    { name: "Camisetas", slug: "camisetas", displayOrder: 1 },
    { name: "Bermudas", slug: "bermudas", displayOrder: 2 },
    { name: "Conjuntos", slug: "conjuntos", displayOrder: 3 },
    { name: "Calçados", slug: "calcados", displayOrder: 4 },
    { name: "Acessórios", slug: "acessorios", displayOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: {
        name: cat.name,
        slug: cat.slug,
        displayOrder: cat.displayOrder,
        active: true,
      },
    });
  }

  const allCategories = await prisma.category.findMany();
  const getCatId = (slug: string) => allCategories.find((c) => c.slug === slug)?.id!;

  // 4. Produtos com Grade de Tamanhos
  const products = [
    {
      name: "Camiseta Streetwear Oversized 'Wolf Heavy' Preta",
      slug: "camiseta-streetwear-oversized-wolf-heavy-preta",
      categoryId: getCatId("camisetas"),
      description: "Camiseta premium 100% algodão penteado fio 26.1 com gramatura pesada 220g. Modelagem oversized autêntica, gola canelada de 3cm e estampa em silk screen de alta durabilidade.",
      originalPrice: 149.90,
      price: 89.90,
      isOutletDiscount: true,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop",
      ],
      variants: [
        { sku: "LOB-CAM-WLF-BLK-P", size: "P", stockQuantity: 2 },
        { sku: "LOB-CAM-WLF-BLK-M", size: "M", stockQuantity: 4 },
        { sku: "LOB-CAM-WLF-BLK-G", size: "G", stockQuantity: 3 },
        { sku: "LOB-CAM-WLF-BLK-GG", size: "GG", stockQuantity: 1 },
      ],
    },
    {
      name: "Bermuda Cargo Streetwear Ripstop Caqui",
      slug: "bermuda-cargo-streetwear-ripstop-caqui",
      categoryId: getCatId("bermudas"),
      description: "Bermuda cargo confeccionada em tecido Ripstop militar de alta resistência. Possui 6 bolsos funcionais, cós elástico com cordão de ajuste e costuras reforçadas.",
      originalPrice: 169.90,
      price: 99.90,
      isOutletDiscount: true,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop",
      ],
      variants: [
        { sku: "LOB-BER-CRG-CAQ-P", size: "P (38)", stockQuantity: 2 },
        { sku: "LOB-BER-CRG-CAQ-M", size: "M (40)", stockQuantity: 5 },
        { sku: "LOB-BER-CRG-CAQ-G", size: "G (42)", stockQuantity: 2 },
        { sku: "LOB-BER-CRG-CAQ-GG", size: "GG (44)", stockQuantity: 0 },
      ],
    },
    {
      name: "Conjunto Moletom Streetwear Essential Off-White",
      slug: "conjunto-moletom-streetwear-essential-off-white",
      categoryId: getCatId("conjuntos"),
      description: "Conjunto blusão canguru + bermuda de moletom 3 cabos flanelado. Conforto térmico, toque macio, capuz forrado e bolso frontal com acabamento de alfaiataria esportiva.",
      originalPrice: 289.90,
      price: 189.90,
      isOutletDiscount: true,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop",
      ],
      variants: [
        { sku: "LOB-CNJ-ESS-OFW-M", size: "M", stockQuantity: 3 },
        { sku: "LOB-CNJ-ESS-OFW-G", size: "G", stockQuantity: 4 },
        { sku: "LOB-CNJ-ESS-OFW-GG", size: "GG", stockQuantity: 2 },
      ],
    },
    {
      name: "Boné Trucker Lobos G Bordado Alto Relevo Preto",
      slug: "bone-trucker-lobos-g-bordado-preto",
      categoryId: getCatId("acessorios"),
      description: "Boné modelo trucker americano com tela respirável traseira, copa estruturada, bordado frontal em alto relevo 3D e fecho ajustável snapback.",
      originalPrice: 99.90,
      price: 59.90,
      isOutletDiscount: true,
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop",
      ],
      variants: [
        { sku: "LOB-BON-TRK-BLK-U", size: "Único", stockQuantity: 12 },
      ],
    },
    {
      name: "Camiseta Boxy Fit 'Acid Wash' Chumbo",
      slug: "camiseta-boxy-fit-acid-wash-chumbo",
      categoryId: getCatId("camisetas"),
      description: "Lavagem especial acid wash estonada que confere efeito vintage exclusivo a cada peça. Corte boxy mais amplo e gola grossa de 3,5cm.",
      originalPrice: 139.90,
      price: 79.90,
      isOutletDiscount: true,
      featured: false,
      images: [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop",
      ],
      variants: [
        { sku: "LOB-CAM-ACD-CHB-P", size: "P", stockQuantity: 3 },
        { sku: "LOB-CAM-ACD-CHB-M", size: "M", stockQuantity: 5 },
        { sku: "LOB-CAM-ACD-CHB-G", size: "G", stockQuantity: 2 },
      ],
    },
    {
      name: "Tênis Streetwear Low Dunk Branco & Preto",
      slug: "tenis-streetwear-low-dunk-branco-preto",
      categoryId: getCatId("calcados"),
      description: "Design clássico do basquete anos 80 reinventado para o streetwear. Cabedal em couro sintético premium, solado em borracha vulcanizada antiderrapante e palmilha conforto.",
      originalPrice: 329.90,
      price: 199.90,
      isOutletDiscount: true,
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
      ],
      variants: [
        { sku: "LOB-TEN-DNK-39", size: "39", stockQuantity: 1 },
        { sku: "LOB-TEN-DNK-40", size: "40", stockQuantity: 3 },
        { sku: "LOB-TEN-DNK-41", size: "41", stockQuantity: 2 },
        { sku: "LOB-TEN-DNK-42", size: "42", stockQuantity: 2 },
      ],
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          categoryId: prod.categoryId,
          description: prod.description,
          originalPrice: prod.originalPrice,
          price: prod.price,
          isOutletDiscount: prod.isOutletDiscount,
          featured: prod.featured,
          images: {
            create: prod.images.map((img, idx) => ({
              imageUrl: img,
              isMain: idx === 0,
              displayOrder: idx + 1,
            })),
          },
          variants: {
            create: prod.variants.map((v) => ({
              sku: v.sku,
              size: v.size,
              stockQuantity: v.stockQuantity,
            })),
          },
        },
      });
      console.log(`✓ Produto criado: ${prod.name}`);
    }
  }

  // 5. Cupom de Boas-Vindas
  await prisma.coupon.upsert({
    where: { code: "LOBOS10" },
    update: {},
    create: {
      code: "LOBOS10",
      discountType: "PERCENTAGE",
      discountValue: 10.00,
      minOrderValue: 100.00,
      active: true,
    },
  });

  console.log("✅ Seed completo finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
