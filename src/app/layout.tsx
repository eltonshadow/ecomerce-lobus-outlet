import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductModal } from "@/components/ProductModal";

export const metadata: Metadata = {
  title: "LOBUS Outlet | Streetwear & Grifes Importadas",
  description:
    "O melhor do streetwear e grifes importadas. Camisetas 40.1, polos, bermudas, moletons e sneakers originais com até 50% OFF no outlet.",
};

const tailwindConfigScript = `tailwind.config={darkMode:"class",theme:{extend:{"colors":{"surface-container-highest":"#353534","background":"#131313","primary-fixed-dim":"#e9c349","on-secondary-fixed-variant":"#5d4201","primary":"#f2ca50","on-secondary-fixed":"#261900","on-primary-container":"#554300","primary-container":"#d4af37","primary-fixed":"#ffe088","tertiary":"#e9cd67","error-container":"#93000a","tertiary-fixed-dim":"#e1c561","on-tertiary-fixed":"#221b00","on-primary-fixed-variant":"#574500","surface-dim":"#131313","surface-container":"#201f1f","on-tertiary-fixed-variant":"#554500","on-tertiary-container":"#534400","surface-tint":"#e9c349","on-surface-variant":"#d0c5af","on-secondary":"#412d00","secondary-fixed":"#ffdea5","surface-bright":"#3a3939","error":"#ffb4ab","surface-container-lowest":"#0e0e0e","outline-variant":"#4d4635","outline":"#99907c","surface-container-high":"#2a2a2a","inverse-surface":"#e5e2e1","secondary-container":"#604403","on-error-container":"#ffdad6","on-primary-fixed":"#241a00","secondary-fixed-dim":"#e9c176","on-background":"#e5e2e1","secondary":"#e9c176","surface":"#131313","inverse-primary":"#735c00","tertiary-container":"#ccb14f","tertiary-fixed":"#fee179","on-tertiary":"#3b2f00","on-surface":"#e5e2e1","surface-container-low":"#1c1b1b","on-secondary-container":"#dab36a","surface-variant":"#353534","inverse-on-surface":"#313030","on-primary":"#3c2f00","on-error":"#690005"},"borderRadius":{"DEFAULT":"0.125rem","lg":"0.25rem","xl":"0.5rem","full":"0.75rem"},"spacing":{"gutter-mobile":"1rem","space-xs":"0.25rem","space-sm":"0.5rem","space-lg":"1.5rem","margin":"3rem","space-xl":"2.5rem","space-md":"1rem","margin-mobile":"1.25rem","gutter":"1.5rem"},"fontFamily":{"label-lg":["Montserrat"],"body-lg":["Inter"],"label-md":["Inter"],"label-sm":["Inter"],"body-md":["Inter"],"headline-md":["Montserrat"],"headline-lg":["Montserrat"],"headline-lg-mobile":["Montserrat"],"display-lg":["Montserrat"],"display-lg-mobile":["Montserrat"],"headline-sm":["Montserrat"],"body-sm":["Inter"]},"fontSize":{"label-lg":["0.875rem",{"lineHeight":"1.2","letterSpacing":"0.12em","fontWeight":"600"}],"body-lg":["1.125rem",{"lineHeight":"1.6","letterSpacing":"0em","fontWeight":"400"}],"label-md":["0.75rem",{"lineHeight":"1.2","letterSpacing":"0.06em","fontWeight":"500"}],"label-sm":["0.6875rem",{"lineHeight":"1.15","letterSpacing":"0.08em","fontWeight":"500"}],"body-md":["0.9375rem",{"lineHeight":"1.55","letterSpacing":"0.01em","fontWeight":"400"}],"headline-md":["1.5rem",{"lineHeight":"1.3","letterSpacing":"0.05em","fontWeight":"600"}],"headline-lg":["2.25rem",{"lineHeight":"1.2","letterSpacing":"0.02em","fontWeight":"600"}],"headline-lg-mobile":["1.75rem",{"lineHeight":"1.25","letterSpacing":"0.01em","fontWeight":"600"}],"display-lg":["3.5rem",{"lineHeight":"1.1","letterSpacing":"-0.02em","fontWeight":"700"}],"display-lg-mobile":["2.25rem",{"lineHeight":"1.15","letterSpacing":"-0.01em","fontWeight":"700"}],"headline-sm":["1.125rem",{"lineHeight":"1.4","letterSpacing":"0.08em","fontWeight":"600"}],"body-sm":["0.8125rem",{"lineHeight":"1.5","letterSpacing":"0.015em","fontWeight":"400"}]}}}}`;

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: tailwindConfigScript }} />
      </head>
      <body className="bg-background font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
        <CartProvider>
          {children}
          <CartDrawer />
          <ProductModal />
        </CartProvider>
      </body>
    </html>
  );
}
