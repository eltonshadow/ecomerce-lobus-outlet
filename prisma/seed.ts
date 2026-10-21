import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

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
    { name: "Polos", slug: "polos", displayOrder: 6 },
    { name: "Moletons & Jaquetas", slug: "moletons-jaquetas", displayOrder: 7 },
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
  const getCatId = (slug: string) => {
    const cat = allCategories.find((c) => c.slug === slug);
    if (!cat) throw new Error(`Categoria do seed não encontrada: ${slug}`);
    return cat.id;
  };

  // 4. Produtos com Grade de Tamanhos
  const products = [
    {
      name: "Camiseta Estonada Heavyweight Black",
      slug: "camiseta-estonada-heavyweight-black",
      categoryId: getCatId("camisetas"),
      description: "Camiseta heavyweight em algodão peruano fio 40.1 com lavagem estonada e gola canelada.",
      originalPrice: 149.00,
      price: 89.90,
      isOutletDiscount: true,
      featured: true,
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDtGzbFeugtPvccukRy91sOUm0T6aNDWi-GbNw7-V_dI3F2qNJDNFViYAa-zF_RBGq3alM0MdYxg63jWD2495_dCFsjhpK-_NwjlPCuF9ZslLUsy_VyGoC223S_Tr2OwP8l74QWh2sH0J78YchS0b0hTZgHVAelEdqHkW0J7eVtYwV-JDruC-HH2xsZcNvu0lkfK6k4WXubHTvAP8UQlisLfYqY_hpr7uj1X0eRqwg-jzLId0uK8L9eag"],
      variants: [
        { sku: "LOB-CAM-EST-BLK-P", size: "P", stockQuantity: 3 },
        { sku: "LOB-CAM-EST-BLK-M", size: "M", stockQuantity: 5 },
        { sku: "LOB-CAM-EST-BLK-G", size: "G", stockQuantity: 4 },
        { sku: "LOB-CAM-EST-BLK-GG", size: "GG", stockQuantity: 2 },
      ],
    },
    {
      name: "Camisa Polo Custom Fit Navy Blue",
      slug: "camisa-polo-custom-fit-navy-blue",
      categoryId: getCatId("polos"),
      description: "Polo em piquet premium, modelagem custom fit e gola com acabamento contrastante.",
      originalPrice: 199.00,
      price: 119.90,
      isOutletDiscount: true,
      featured: true,
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuD-bThnYk2FpKU0Zd35PJbOjGu-qFotmFBXimOS3ve-JFstj5gmCT_SFE7KG_jBkDL_8l8BiJ7GOOiTUxtfJiaEAgDnGsum4ZsU6fyILS197BZhp4AzoXigwKbUyvAiLhPHjudsitILYBIWMx_pMNOrT_PaTb2RkTk87nSFnjsAt91PUvheMgaqe2-tmh5sBXAXgUTJlSTkhu2jcHgweLqc9CJWXxYl1QgXiz0CG1jiwBWVIGXKulj1dw"],
      variants: [
        { sku: "LOB-POL-CST-NVY-P", size: "P", stockQuantity: 2 },
        { sku: "LOB-POL-CST-NVY-M", size: "M", stockQuantity: 4 },
        { sku: "LOB-POL-CST-NVY-G", size: "G", stockQuantity: 4 },
        { sku: "LOB-POL-CST-NVY-GG", size: "GG", stockQuantity: 1 },
      ],
    },
    {
      name: "Bermuda Jeans Destroyed Slim Confort",
      slug: "bermuda-jeans-destroyed-slim-confort",
      categoryId: getCatId("bermudas"),
      description: "Bermuda jeans com elastano, lavagem destroyed e modelagem slim confortável.",
      originalPrice: 229.00,
      price: 139.90,
      isOutletDiscount: true,
      featured: true,
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDlWmeh1kGwJgd4hwgHhu1Z_VEecmAiDoK2OYDq0qqviKkGwn4NJlSRgqbda2Fqd9xuFjWpysPxvbj6XYxRcWpgFhdP2e6lF89xeFkmRrxrU3f4cLOtAMA6zLeZwKyGGVMt27ypKy2AauhFjsZVvTT_r1Bjko2Lk3Zzk--NFE5EzbLt75jqsmhdw2yzF27JxXwOnBziV9krCNL8nwtGEPk2DoUOwl4LC0ib6hsg7SMu7DwP57c3NO8UPQ"],
      variants: [
        { sku: "LOB-BER-JNS-DST-38", size: "38", stockQuantity: 2 },
        { sku: "LOB-BER-JNS-DST-40", size: "40", stockQuantity: 3 },
        { sku: "LOB-BER-JNS-DST-42", size: "42", stockQuantity: 3 },
        { sku: "LOB-BER-JNS-DST-44", size: "44", stockQuantity: 1 },
      ],
    },
    {
      name: "Moletom Canguru Oversized Acid Wash",
      slug: "moletom-canguru-oversized-acid-wash",
      categoryId: getCatId("moletons-jaquetas"),
      description: "Moletom canguru heavyweight 3 cabos flanelado, lavagem acid wash e capuz forrado.",
      originalPrice: 289.00,
      price: 189.90,
      isOutletDiscount: true,
      featured: true,
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBxAd4dDNSw0aDQOFFW6WSWAzBPT1S5zMtZnUXDLtk3f1CPcHjIoHr2CjWot_QhbSZVC_5PPM6qkwPwempaON8pp1SS44DsXBy4QxHPOKHCZFLBL3rowFc2I0Ha0t_m6RgfoKGlsP2tLOnkD5iAvlDE9rJ91YGf8zCZ9jjh0z_YvQ6LtJ2q9XJBC7YuXBIaRYA8B_Gech5kVJBgv7IH9UqEs_q3meVcgtn4dCxeWnFN9LjbpMok9K--5w"],
      variants: [
        { sku: "LOB-MOL-CNG-ACD-P", size: "P", stockQuantity: 1 },
        { sku: "LOB-MOL-CNG-ACD-M", size: "M", stockQuantity: 3 },
        { sku: "LOB-MOL-CNG-ACD-G", size: "G", stockQuantity: 3 },
        { sku: "LOB-MOL-CNG-ACD-GG", size: "GG", stockQuantity: 2 },
      ],
    },
    {
      name: "Tênis Casual Couro Street White & Gold",
      slug: "tenis-casual-couro-street-white-gold",
      categoryId: getCatId("calcados"),
      description: "Tênis casual em couro genuíno branco com detalhes dourados e solado de borracha.",
      originalPrice: 399.00,
      price: 259.90,
      isOutletDiscount: true,
      featured: true,
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuCprVJwPtqX4RHBt2chyIeVAGZeBV-7NXlI2zXhTstwFk15pGrJckA3mQWRnX_O8MhYXUAHi_LWd2tLuOxRR9ezBVJSG8V7HC4LoVL7RAfge6RTA4KLjNKMURsIp4IhJ0GUSLhfNQIw6fLQGh3z50QOpQ-El3WLdcGpLqu_6pQc-Wp3qbyVPdSZ5I9A4vHrbzSk6bSq60H6WzKYwYvlUsjjYbqdtElCQMvaKFyJ6R6dXgIdbVRtFOREuw"],
      variants: [
        { sku: "LOB-TEN-CRO-WGD-39", size: "39", stockQuantity: 1 },
        { sku: "LOB-TEN-CRO-WGD-40", size: "40", stockQuantity: 2 },
        { sku: "LOB-TEN-CRO-WGD-41", size: "41", stockQuantity: 2 },
        { sku: "LOB-TEN-CRO-WGD-42", size: "42", stockQuantity: 1 },
      ],
    },
    {
      name: "Bermuda Sarja Cargo Utilitária Chumbo",
      slug: "bermuda-sarja-cargo-utilitaria-chumbo",
      categoryId: getCatId("bermudas"),
      description: "Bermuda cargo em sarja premium com bolsos utilitários reforçados.",
      originalPrice: 199.00,
      price: 129.90,
      isOutletDiscount: true,
      featured: true,
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBC6l4kfDAW6lqwjT_Bxwz2rFJ1lYP2AZcGncovfGy2DKEWDRwYnR58HTwnRXA0E_vJyvL1uTb-q6IaFTrisLPwm1QC7V2f4LrWwQOX_MZfK_oLKSSRuXinxDZUI4biMW_b-y87EXtqvptCEDOHVqHr9hP0tR042R-BpNJXBK8twkmvRpcOWUp5yVHf6L1oL6D_Py10TNdvqFOwAb4ve-ulGqOxt76sQZmBzU6LGH0lp40Y2QvxYgCIEA"],
      variants: [
        { sku: "LOB-BER-SRJ-CHB-38", size: "38", stockQuantity: 1 },
        { sku: "LOB-BER-SRJ-CHB-40", size: "40", stockQuantity: 2 },
        { sku: "LOB-BER-SRJ-CHB-42", size: "42", stockQuantity: 1 },
        { sku: "LOB-BER-SRJ-CHB-44", size: "44", stockQuantity: 0 },
      ],
    },
    {
      name: "Jaqueta Windbreaker Impermeável",
      slug: "jaqueta-windbreaker-impermeavel",
      categoryId: getCatId("moletons-jaquetas"),
      description: "Jaqueta corta-vento impermeável com capuz embutido e ziper frontal.",
      originalPrice: 269.00,
      price: 179.90,
      isOutletDiscount: true,
      featured: true,
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuAuLgSwYaTI37EXqm2IMpl9BezfPKXQOeryVqVSffUbh7ektb9WLt9Dj8aVA2122xG-TDj6eZPNUIEjtoYTmARrx7oS3jYCVL1IY4t5cfWPPQpYHhIB_dbVUepGRyLmxJD1A5StliPOC0prUjzPILKRHsBr0Xw15tzV_lUq2d5h_igkRyL6H9DeuErNhGuLlSyQe-dUKxT78TjvHyIwAq2SQPkgzrF0yPoM9sDZHDbFripCB7y9szt3Ig"],
      variants: [
        { sku: "LOB-JAQ-WND-BLK-P", size: "P", stockQuantity: 2 },
        { sku: "LOB-JAQ-WND-BLK-M", size: "M", stockQuantity: 3 },
        { sku: "LOB-JAQ-WND-BLK-G", size: "G", stockQuantity: 2 },
        { sku: "LOB-JAQ-WND-BLK-GG", size: "GG", stockQuantity: 1 },
      ],
    },
    {
      name: "Boné Aba Curva Bordado 3D Lobus",
      slug: "bone-aba-curva-bordado-3d-lobus",
      categoryId: getCatId("acessorios"),
      description: "Boné aba curva estruturado com bordado 3D frontal e fecho ajustável.",
      originalPrice: 129.00,
      price: 79.90,
      isOutletDiscount: true,
      featured: true,
      images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuDcLOrJ3MZUXnyTSFjWEddVrCQZ5owLxX_ZTshQ4sdTdDGP56mG9apTpKuX188r8Ivcg4RAgbCXUAuqnvqHCUXv9YDXfp34JS-v7bhKsUSv2qTk7KlrrBJ67D3PPFbGAWABybFeeyY_W7-40R2sxWdxNh7nEWmi3uqAaXrxKLq0P1y0QtTvTviWHJH3dHQUE7CM37B-up7l0CceBjYo9QdCulzf03vMmmSGHk4nJWsLzGcxnau2B-jOMg"],
      variants: [
        { sku: "LOB-BON-ABC-LOB-UN", size: "Único", stockQuantity: 10 },
      ],
    },
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
        "/products/camiseta-wolf-heavy-preta.jpg",
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
        "/products/bermuda-cargo-ripstop-caqui.jpg",
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
        "/products/conjunto-moletom-essential-off-white.jpg",
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
        "/products/bone-trucker-preto.jpg",
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
        "/products/camiseta-boxy-acid-wash-chumbo.jpg",
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
        "/products/tenis-low-dunk-branco-preto.jpg",
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

  // Fotos antigas do seed (banco de imagens) não batiam com o produto. Troca só onde a URL
  // ainda é a original do seed, então foto cadastrada pelo admin nunca é sobrescrita.
  const oldPhotos: Record<string, string | null> = {
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop": "/products/camiseta-wolf-heavy-preta.jpg",
    "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop": "/products/bermuda-cargo-ripstop-caqui.jpg",
    "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop": "/products/conjunto-moletom-essential-off-white.jpg",
    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800&auto=format&fit=crop": "/products/bone-trucker-preto.jpg",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop": "/products/camiseta-boxy-acid-wash-chumbo.jpg",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop": "/products/tenis-low-dunk-branco-preto.jpg",
    "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop": null,
    "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?q=80&w=800&auto=format&fit=crop": null,
  };
  for (const [from, to] of Object.entries(oldPhotos)) {
    const r = to
      ? await prisma.productImage.updateMany({ where: { imageUrl: from }, data: { imageUrl: to } })
      : await prisma.productImage.deleteMany({ where: { imageUrl: from } });
    if (r.count) console.log(`✓ Foto ${to ? "trocada" : "removida"}: ${to ?? from}`);
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

  // 6. Admin inicial: só cria se ADMIN_EMAIL e ADMIN_PASSWORD vierem do ambiente (nunca senha no git).
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const exists = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
    if (!exists) {
      await prisma.adminUser.create({
        data: { name: "Administrador", email: adminEmail, passwordHash: hashPassword(adminPassword), role: "ADMIN" },
      });
      console.log(`✓ Admin criado: ${adminEmail}`);
    }
  } else {
    console.log("⚠ ADMIN_EMAIL/ADMIN_PASSWORD não definidos: nenhum admin criado.");
  }

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
