import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "InHtml AI | Del papel al Código",
  description:
    "Dibuja un elemento y obtén su HTML y CSS con la potencia de Groq AI.",
  applicationName: "InHtml",
  authors: [{ name: "LyPaw" }],
  creator: "LyPaw",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "InHtml AI",
    description:
      "Dibuja un elemento y obtén su HTML y CSS con la potencia de Groq AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} scroll-smooth`}>
      <body className="bg-[#030014] text-slate-200 antialiased min-h-screen selection:bg-pink-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
