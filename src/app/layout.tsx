import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voronoi Atelier - Graphes 2D Interactifs",
  description:
    "Explorez les diagrammes de Voronoï, alpha-shapes, alpha-complexes, graphes de Gabriel, RNG, NN-crust et arbres de recouvrement minimal. Ajoutez et déplacez des points en temps réel avec une animation fluide à 30 fps.",
  keywords: [
    "Voronoï",
    "Voronoi",
    "diagramme",
    "alpha-shape",
    "alpha-complex",
    "graphe de Gabriel",
    "RNG",
    "relative neighborhood graph",
    "NN-crust",
    "MST",
    "minimum spanning tree",
    "géométrie computationnelle",
    "visualisation interactive",
    "algorithme géométrique",
  ],
  authors: [{ name: "Voronoi Atelier" }],
  creator: "Voronoi Atelier",
  openGraph: {
    title: "Voronoi Atelier - Graphes 2D Interactifs",
    description:
      "Explorez les diagrammes de Voronoï, alpha-shapes, graphes de proximité et plus encore. Visualisation interactive en temps réel.",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Voronoi Atelier Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Voronoi Atelier - Graphes 2D Interactifs",
    description:
      "Explorez les diagrammes de Voronoï, alpha-shapes, graphes de proximité et plus encore.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
