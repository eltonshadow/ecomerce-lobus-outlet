import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🐝 Populando banco de dados oficial da Tropa da Mauá...");

  // 1. Ponto de Retirada Oficial (Arena Mauá / Dia de Jogo)
  await prisma.pickupPoint.upsert({
    where: { id: "arena-maua" },
    update: {
      name: "Arena Mauá (Campo Oficial) & Sede da Torcida",
      address: "Arena Mauá — Sede da Torcida & Campo Central (Mauá - SP)",
      openingHours: "Terça a Sexta: 18:00 às 22:00 | Sábado e Domingo: 08:00 às 18:00 (Dias de Jogo)",
      instructions: "Apresente o número do pedido ou comprovante do Pix na tenda oficial da diretoria no campo de jogo.",
      active: true,
    },
    create: {
      id: "arena-maua",
      name: "Arena Mauá (Campo Oficial) & Sede da Torcida",
      address: "Arena Mauá — Sede da Torcida & Campo Central (Mauá - SP)",
      openingHours: "Terça a Sexta: 18:00 às 22:00 | Sábado e Domingo: 08:00 às 18:00 (Dias de Jogo)",
      instructions: "Apresente o número do pedido ou comprovante do Pix na tenda oficial da diretoria no campo de jogo.",
      active: true,
    },
  });

  // 2. Zonas de Entrega por Motoboy e Envio
  const zones = [
    {
      id: "zone-maua-express",
      name: "Mauá e Bairros Vizinhos (Entrega Expressa)",
      cepPrefixes: ["09300", "09310", "09320", "09330", "09340", "09350", "09360", "09370", "09380", "09390", "74703"], // inclui prefixos de teste
      neighborhoods: ["Centro", "Jardim Zaíra", "Vila Magini", "Itapeva", "Guapituba", "Paranavaí", "Vila Mercedes"],
      deliveryFee: 10.00,
      estimatedDeliveryHours: 12,
      freeShippingAbove: 199.00,
      active: true,
    },
    {
      id: "zone-grande-abc",
      name: "Grande ABC (Santo André, SBC, Diadema, Ribeirão Pires)",
      cepPrefixes: ["09000", "09100", "09200", "09400", "09500", "09600", "09700", "09800", "09900", "74000"],
      neighborhoods: ["Santo André", "São Bernardo do Campo", "São Caetano do Sul", "Diadema", "Ribeirão Pires"],
      deliveryFee: 16.00,
      estimatedDeliveryHours: 24,
      freeShippingAbove: 249.00,
      active: true,
    },
    {
      id: "zone-sp-capital",
      name: "São Paulo Capital e Grande SP",
      cepPrefixes: ["01000", "02000", "03000", "04000", "05000", "08000", "74300"],
      neighborhoods: ["Zona Leste", "Zona Sul", "Zona Norte", "Zona Oeste", "Centro"],
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

  // 3. Categorias Oficiais
  const categories = [
    { name: "Mantos de Jogo", slug: "mantos-de-jogo", displayOrder: 1 },
    { name: "Treino & Torcida", slug: "treino-torcida", displayOrder: 2 },
    { name: "Agasalhos & Calções", slug: "agasalhos-calcoes", displayOrder: 3 },
    { name: "Acessórios", slug: "acessorios", displayOrder: 4 },
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
    if (!cat) throw new Error(`Categoria não encontrada: ${slug}`);
    return cat.id;
  };

  // 4. Produtos e Mantos da Tropa da Mauá
  const products = [
    {
      name: "Manto Titular 2026/27 — Listrado Clássico 'O Enxame'",
      slug: "manto-titular-2026-tropa-da-maua",
      categorySlug: "mantos-de-jogo",
      description: "Manto sagrado oficial nº 1 da Tropa da Mauá temporada 2026/27. Produzido em tecido Dry-Fit tecnológico com acabamento colmeia respirável, escudo oficial bordado em alta definição, patch termocolante e gola V reforçada. O manto que impõe respeito na várzea.",
      price: 139.90,
      originalPrice: 169.90,
      isOutletDiscount: true,
      featured: true,
      modelInfo: "Atleta tem 1,80m, 78kg e veste tamanho G",
      measurementsGuide: {
        headers: ["size", "Torax (cm)", "Comprimento (cm)", "Manga (cm)"],
        rows: [
          { size: "P", "Torax (cm)": "50", "Comprimento (cm)": "69", "Manga (cm)": "22" },
          { size: "M", "Torax (cm)": "53", "Comprimento (cm)": "72", "Manga (cm)": "23" },
          { size: "G", "Torax (cm)": "56", "Comprimento (cm)": "75", "Manga (cm)": "24" },
          { size: "GG", "Torax (cm)": "59", "Comprimento (cm)": "78", "Manga (cm)": "25" },
          { size: "XG", "Torax (cm)": "62", "Comprimento (cm)": "81", "Manga (cm)": "26" },
        ],
      },
      images: ["/products/manto-titular-maua.jpg"],
      variants: [
        { sku: "TDM-TIT-P", size: "P", stockQuantity: 15 },
        { sku: "TDM-TIT-M", size: "M", stockQuantity: 25 },
        { sku: "TDM-TIT-G", size: "G", stockQuantity: 30 },
        { sku: "TDM-TIT-GG", size: "GG", stockQuantity: 20 },
        { sku: "TDM-TIT-XG", size: "XG", stockQuantity: 10 },
      ],
    },
    {
      name: "Manto Reserva 2026/27 — Blackout Ferrão",
      slug: "manto-reserva-blackout-ferrao",
      categorySlug: "mantos-de-jogo",
      description: "Manto oficial nº 2 em edição especial Blackout. Fundo preto com textura favos de mel em sublimação premium e detalhes em amarelo ouro nos punhos e gola. Escudo monocromático com alto brilho. Elegância pura para dominar fora de casa.",
      price: 139.90,
      originalPrice: 169.90,
      isOutletDiscount: true,
      featured: true,
      modelInfo: "Modelo tem 1,77m, 74kg e veste tamanho M",
      measurementsGuide: {
        headers: ["size", "Torax (cm)", "Comprimento (cm)"],
        rows: [
          { size: "P", "Torax (cm)": "50", "Comprimento (cm)": "69" },
          { size: "M", "Torax (cm)": "53", "Comprimento (cm)": "72" },
          { size: "G", "Torax (cm)": "56", "Comprimento (cm)": "75" },
          { size: "GG", "Torax (cm)": "59", "Comprimento (cm)": "78" },
          { size: "XG", "Torax (cm)": "62", "Comprimento (cm)": "81" },
        ],
      },
      images: ["/products/manto-reserva-blackout.jpg"],
      variants: [
        { sku: "TDM-RES-P", size: "P", stockQuantity: 12 },
        { sku: "TDM-RES-M", size: "M", stockQuantity: 22 },
        { sku: "TDM-RES-G", size: "G", stockQuantity: 26 },
        { sku: "TDM-RES-GG", size: "GG", stockQuantity: 18 },
        { sku: "TDM-RES-XG", size: "XG", stockQuantity: 8 },
      ],
    },
    {
      name: "Manto de Goleiro 2026/27 — Guardião da Mauá",
      slug: "manto-goleiro-guardiao-da-maua",
      categorySlug: "mantos-de-jogo",
      description: "A camisa oficial de paredão da Tropa da Mauá. Amarelo volt com grafismos agressivos em preto e tecnologia Dry Tech. Desenvolvida para máxima mobilidade e impacto visual nas traves.",
      price: 149.90,
      originalPrice: 179.90,
      isOutletDiscount: true,
      featured: false,
      modelInfo: "Goleiro tem 1,86m, 84kg e veste tamanho GG",
      images: ["/products/manto-goleiro-maua.jpg"],
      variants: [
        { sku: "TDM-GOL-M", size: "M", stockQuantity: 8 },
        { sku: "TDM-GOL-G", size: "G", stockQuantity: 12 },
        { sku: "TDM-GOL-GG", size: "GG", stockQuantity: 10 },
      ],
    },
    {
      name: "Camiseta Casual Torcida — 'Respeita o Ferrão'",
      slug: "camiseta-torcida-respeita-o-ferrao",
      categorySlug: "treino-torcida",
      description: "Camiseta casual de torcida 100% algodão premium penteado fio 30.1. Modelagem streetwear confortável e estampa em serigrafia de alta definição com o mascote Abelha e o lema 'Respeita o Ferrão'. Vista na arquibancada ou no rolê.",
      price: 79.90,
      originalPrice: 99.90,
      isOutletDiscount: true,
      featured: true,
      modelInfo: "Torcedor tem 1,75m, 72kg e veste tamanho M",
      images: ["/products/camiseta-casual-torcida.jpg"],
      variants: [
        { sku: "TDM-TSH-P", size: "P", stockQuantity: 15 },
        { sku: "TDM-TSH-M", size: "M", stockQuantity: 25 },
        { sku: "TDM-TSH-G", size: "G", stockQuantity: 30 },
        { sku: "TDM-TSH-GG", size: "GG", stockQuantity: 20 },
        { sku: "TDM-TSH-XG", size: "XG", stockQuantity: 10 },
      ],
    },
    {
      name: "Corta-Vento Impermeável Mauá — Black & Yellow",
      slug: "corta-vento-impermeavel-maua",
      categorySlug: "agasalhos-calcoes",
      description: "Jaqueta esportiva impermeável com capuz regulável, forro interno respirável e zíper tratorado em amarelo vibrante. O agasalho ideal para acompanhar a Tropa nas noites frias e jogos de mata-mata.",
      price: 189.90,
      originalPrice: 229.90,
      isOutletDiscount: true,
      featured: true,
      modelInfo: "Modelo veste tamanho G",
      images: ["/products/corta-vento-maua.jpg"],
      variants: [
        { sku: "TDM-CVT-P", size: "P", stockQuantity: 10 },
        { sku: "TDM-CVT-M", size: "M", stockQuantity: 18 },
        { sku: "TDM-CVT-G", size: "G", stockQuantity: 20 },
        { sku: "TDM-CVT-GG", size: "GG", stockQuantity: 12 },
      ],
    },
    {
      name: "Calção de Jogo Oficial 2026/27",
      slug: "calcao-jogo-oficial-2026-maua",
      categorySlug: "agasalhos-calcoes",
      description: "Calção oficial de jogo confeccionado em tecido Dry Tech preto com faixas laterais amarelas e o escudo da Tropa da Mauá bordado. Cós anatômico e cordão de amarração reforçado.",
      price: 59.90,
      originalPrice: 79.90,
      isOutletDiscount: true,
      featured: false,
      images: ["/products/calcao-jogo-preto.jpg"],
      variants: [
        { sku: "TDM-SHR-P", size: "P", stockQuantity: 15 },
        { sku: "TDM-SHR-M", size: "M", stockQuantity: 25 },
        { sku: "TDM-SHR-G", size: "G", stockQuantity: 30 },
        { sku: "TDM-SHR-GG", size: "GG", stockQuantity: 20 },
      ],
    },
    {
      name: "Boné Trucker Mauá Bordado 3D",
      slug: "bone-trucker-maua-bordado-3d",
      categorySlug: "acessorios",
      description: "Boné trucker clássico com aba curva, telinha preta traseira respirável e fechamento snapback ajustável. O escudo da Abelha é bordado na parte frontal em alto relevo 3D amarelo.",
      price: 59.90,
      originalPrice: 79.90,
      isOutletDiscount: true,
      featured: true,
      images: ["/products/bone-trucker-maua.jpg"],
      variants: [
        { sku: "TDM-CAP-U", size: "Único", stockQuantity: 40 },
      ],
    },
    {
      name: "Copo Térmico 473ml Tropa da Mauá + Tirante",
      slug: "copo-termico-473ml-tropa-da-maua-tirante",
      categorySlug: "acessorios",
      description: "Copo térmico em inox com acabamento preto fosco e gravação a laser da abelha e escudo da Tropa da Mauá. Mantém sua bebida trincando por horas. Acompanha tirante oficial com estampa exclusiva.",
      price: 49.90,
      originalPrice: 69.90,
      isOutletDiscount: true,
      featured: true,
      images: ["/products/copo-termico-maua.jpg"],
      variants: [
        { sku: "TDM-CUP-U", size: "Único", stockQuantity: 50 },
      ],
    },
    {
      name: "Bandeirão Oficial Torcida (1,50m x 1,00m)",
      slug: "bandeirao-oficial-torcida-maua",
      categorySlug: "acessorios",
      description: "Bandeira oficial da torcida em tecido Oxford de alta resistência. Amarela e preta com escudo gigante centralizado e ilhoses de metal reforçados para fixar no alambrado do campo.",
      price: 69.90,
      originalPrice: 89.90,
      isOutletDiscount: true,
      featured: false,
      images: ["/products/bandeira-torcida-maua.jpg"],
      variants: [
        { sku: "TDM-BAN-U", size: "Único", stockQuantity: 25 },
      ],
    },
  ];

  for (const prod of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
      include: { images: true, variants: true },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: prod.name,
          categoryId: getCatId(prod.categorySlug),
          description: prod.description,
          price: prod.price,
          originalPrice: prod.originalPrice,
          isOutletDiscount: prod.isOutletDiscount,
          featured: prod.featured,
          active: true,
          measurementsGuide: prod.measurementsGuide ?? undefined,
        },
      });

      // Atualiza imagens
      await prisma.productImage.deleteMany({ where: { productId: existing.id } });
      await prisma.productImage.createMany({
        data: prod.images.map((url, idx) => ({
          productId: existing.id,
          imageUrl: url,
          altText: prod.name,
          isMain: idx === 0,
          displayOrder: idx + 1,
        })),
      });

      console.log(`✓ Produto atualizado: ${prod.name}`);
    } else {
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          categoryId: getCatId(prod.categorySlug),
          description: prod.description,
          price: prod.price,
          originalPrice: prod.originalPrice,
          isOutletDiscount: prod.isOutletDiscount,
          featured: prod.featured,
          measurementsGuide: prod.measurementsGuide ?? undefined,
          images: {
            create: prod.images.map((url, idx) => ({
              imageUrl: url,
              altText: prod.name,
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

  // 5. Cupons da Tropa
  const coupons = [
    { code: "ENXAME10", discountType: "PERCENTAGE" as const, discountValue: 10.00, minOrderValue: 80.00 },
    { code: "MAUA10", discountType: "PERCENTAGE" as const, discountValue: 10.00, minOrderValue: 100.00 },
    { code: "PRIMEIRACOMPRA", discountType: "FIXED_AMOUNT" as const, discountValue: 15.00, minOrderValue: 120.00 },
  ];

  for (const c of coupons) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: { ...c, active: true },
    });
  }

  // 6. Admin inicial do Clube
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@tropadamaua.com.br").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "maua2026";
  const exists = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    await prisma.adminUser.create({
      data: {
        name: "Diretoria Tropa da Mauá",
        email: adminEmail,
        passwordHash: hashPassword(adminPassword),
        role: "ADMIN",
      },
    });
    console.log(`✓ Admin criado: ${adminEmail} (senha: ${adminPassword})`);
  }

  console.log("🐝 Seed oficial da Tropa da Mauá finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
