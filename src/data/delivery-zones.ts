export interface LocalDeliveryZone {
  id: string;
  name: string;
  description: string;
  fee: number;
  estimatedHours: string;
  freeAbove: number;
  cepPrefixes: string[];
}

export const PICKUP_STORE_INFO = {
  name: "Arena Mauá (Campo Oficial) & Sede da Torcida",
  neighborhood: "Arena Mauá",
  city: "Mauá - SP",
  address: "Arena Mauá — Sede da Torcida & Campo Central (Retirada em dias de treino e jogos)",
  openingHours: "Terça a Sexta: 18h às 22h | Sábado e Domingo: 08h às 18h (Dias de Jogo)",
  fee: 0,
  time: "Retirada no campo no dia do jogo ou na sede",
  whatsapp: "5511999999999",
  instagram: "https://www.instagram.com/tropadamaua",
};

export const LOCAL_DELIVERY_ZONES: LocalDeliveryZone[] = [
  {
    id: "zone-1",
    name: "Mauá e Bairros Vizinhos (Entrega Expressa)",
    description: "Centro de Mauá, Zaíra, Vila Magini, Itapeva, Guapituba, Paranavaí",
    fee: 10.00,
    estimatedHours: "Mesmo dia (pedidos até 14h)",
    freeAbove: 199.00,
    cepPrefixes: ["09300", "09310", "09320", "09330", "09340", "09350", "09360", "09370", "09380", "09390"],
  },
  {
    id: "zone-2",
    name: "Grande ABC (Santo André, SBC, Diadema, Ribeirão Pires)",
    description: "Santo André, São Bernardo do Campo, São Caetano, Diadema, Ribeirão Pires",
    fee: 16.00,
    estimatedHours: "Mesmo dia ou até 24h",
    freeAbove: 249.00,
    cepPrefixes: ["09000", "09100", "09200", "09400", "09500", "09600", "09700", "09800", "09900"],
  },
  {
    id: "zone-3",
    name: "São Paulo Capital e Grande SP",
    description: "Zona Leste, Zona Sul, Centro, Zona Norte, Zona Oeste e Região Metropolitana",
    fee: 22.00,
    estimatedHours: "Em até 24h a 48h úteis",
    freeAbove: 299.00,
    cepPrefixes: ["01000", "02000", "03000", "04000", "05000", "08000"],
  },
];

export function calculateLocalDelivery(cepOrNeighborhood: string, subtotal: number) {
  const cleanInput = cepOrNeighborhood.replace(/\D/g, "");
  
  // Se digitou CEP, tenta casar com os prefixos
  if (cleanInput.length >= 5) {
    const prefix5 = cleanInput.slice(0, 5);
    const matchedZone = LOCAL_DELIVERY_ZONES.find((z) =>
      z.cepPrefixes.some((p) => prefix5.startsWith(p.slice(0, 4)))
    );

    if (matchedZone) {
      const isFree = subtotal >= matchedZone.freeAbove;
      return {
        zone: matchedZone,
        fee: isFree ? 0 : matchedZone.fee,
        isFree,
        estimatedTime: matchedZone.estimatedHours,
      };
    }
  }

  // Padrão de contingência para Goiânia
  return {
    zone: LOCAL_DELIVERY_ZONES[0],
    fee: subtotal >= 199 ? 0 : 12.00,
    isFree: subtotal >= 199,
    estimatedTime: "Consulte via WhatsApp para confirmação do motoboy",
  };
}
