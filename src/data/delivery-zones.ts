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
  name: "Loja Física Lobos G Outlet",
  neighborhood: "Jardim Novo Mundo",
  city: "Goiânia - GO",
  address: "Jardim Novo Mundo, Goiânia - GO (Próximo à Praça Principal)",
  openingHours: "Segunda a Sexta: 09:00 às 19:00 | Sábado: 09:00 às 16:00",
  fee: 0,
  time: "Pronto em até 1 hora",
  whatsapp: "5562999999999",
  instagram: "https://www.instagram.com/lobosg.outlet",
};

export const LOCAL_DELIVERY_ZONES: LocalDeliveryZone[] = [
  {
    id: "zone-1",
    name: "Região Leste / Jardim Novo Mundo e Adjacências",
    description: "Jardim Novo Mundo, Vila Morais, Riviera, Universitário, Leste Universitário",
    fee: 10.00,
    estimatedHours: "Mesmo dia (pedidos até 14h)",
    freeAbove: 199.00,
    cepPrefixes: ["74703", "74705", "74710", "74713", "74715", "74605", "74610"],
  },
  {
    id: "zone-2",
    name: "Goiânia Central, Sul e Oeste",
    description: "Centro, Setor Bueno, Marista, Oeste, Pedro Ludovico, Jardim Goiás, Bela Vista",
    fee: 16.00,
    estimatedHours: "Mesmo dia ou até 24h",
    freeAbove: 249.00,
    cepPrefixes: ["74000", "74100", "74200", "74800", "74110", "74150", "74215"],
  },
  {
    id: "zone-3",
    name: "Demais Bairros de Goiânia & Aparecida de Goiânia",
    description: "Norte Ferroviário, Urias Magalhães, Vera Cruz, Garavelo, Buriti Sereno",
    fee: 22.00,
    estimatedHours: "Em até 24h a 48h úteis",
    freeAbove: 299.00,
    cepPrefixes: ["74300", "74400", "74500", "74900"],
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
