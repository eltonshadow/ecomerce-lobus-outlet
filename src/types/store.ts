export interface ProductVariant {
  id: string;
  sku: string;
  size: string; // P, M, G, GG, XG, 38, 40...
  colorName?: string;
  colorHex?: string;
  stockQuantity: number;
}

export interface MeasurementsGuide {
  headers: string[];
  rows: {
    size: string;
    [key: string]: string;
  }[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  description: string;
  originalPrice?: number;
  price: number;
  isOutletDiscount: boolean;
  images: string[];
  variants: ProductVariant[];
  measurementsGuide?: MeasurementsGuide;
  modelInfo?: string; // ex: "Modelo tem 1,82m, 80kg e veste tamanho G"
  featured?: boolean;
}

export interface CartItem {
  variantId: string;
  product: Product;
  selectedSize: string;
  quantity: number;
  unitPrice: number;
}

export type DeliveryType = "PICKUP" | "MOTOBOY";

export interface DeliveryOption {
  type: DeliveryType;
  name: string;
  price: number;
  estimatedTime: string;
  description: string;
}
