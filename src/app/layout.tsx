import type { Metadata, Viewport } from "next";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

const SITE_URL = "https://olhosdedeus.vercel.app";
const SITE_NAME = "OLHOS DE DEUS";
const SITE_TITLE = "OLHOS DE DEUS — Inteligência Situacional de Moçambique";
const SITE_DESCRIPTION = "Plataforma de consciência situacional baseada em fontes públicas e dados autorizados, reunindo eventos geoespaciais, clima, aviação, marítimo, desastres, notícias e outros sinais em um mapa operacional interativo.";

export const viewport: Viewport = {
  themeColor: "#06060C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | OLHOS DE DEUS",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Olhos de Deus",
    "Moçambique",
    "inteligência situacional",
    "inteligência de fontes abertas",
    "OSINT",
    "GEOINT",
    "mapa de Moçambique",
    "dados públicos",
    "alertas",
    "desastres",
    "clima",
    "aviação",
    "marítimo",
  ],
  authors: [{ name: "OLHOS DE DEUS" }],
  creator: "OLHOS DE DEUS",
  publisher: "OLHOS DE DEUS",
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    siteName: SITE_NAME,
    locale: "pt_MZ",
    url: SITE_URL,
  },
  category: "technology",
  classification: "Situational Awareness & Open Intelligence",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": SITE_NAME,
    "mobile-web-app-capable": "yes",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  alternateName: ["Olhos de Deus", "OLHOS"],
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: "GovernmentApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires a modern web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "MZN",
  },
  featureList: [
    "Globo 3D interativo",
    "Camadas geoespaciais de inteligência",
    "Monitorização de aviação e atividade marítima",
    "Monitorização de clima e desastres",
    "Eventos sísmicos e incêndios",
    "Notícias e fontes abertas",
    "Alertas e consciência situacional",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-MZ" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <ErrorBoundary name="OLHOS DE DEUS Core">
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
