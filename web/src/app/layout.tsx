import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Baby shower de Scarlett",
  description: "Celebra con nosotros el baby shower de nuestra baby Scarlett",
  openGraph: {
    title: "Baby shower de Scarlett",
    description: "Celebra con nosotros el baby shower de nuestra baby Scarlett",
    type: "website",
    locale: "es_CO",
  },
};

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FloatingCart } from "@/components/FloatingCart";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          {children}
          <Toaster position="top-center" richColors />
          <FloatingCart />
        </TooltipProvider>
      </body>
    </html>
  );
}
