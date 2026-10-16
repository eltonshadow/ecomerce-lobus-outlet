import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductModal } from "@/components/ProductModal";
import { fontsHref, tailwindConfig } from "@/design/tokens";

export const metadata: Metadata = {
  title: "LOBUS Outlet | Streetwear & Grifes Importadas",
  description:
    "O melhor do streetwear e grifes importadas. Camisetas 40.1, polos, bermudas, moletons e sneakers originais com até 50% OFF no outlet.",
};

const tailwindConfigScript = `tailwind.config=${JSON.stringify(tailwindConfig)}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href={fontsHref}
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: tailwindConfigScript }} />
      </head>
      <body className="bg-ink font-body text-body-md text-paper antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
        <CartProvider>
          {children}
          <CartDrawer />
          <ProductModal />
        </CartProvider>
      </body>
    </html>
  );
}
