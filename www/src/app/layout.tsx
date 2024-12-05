import "@/styles/globals.css";

import { type Metadata } from "next";
import { Archivo_Black, Share_Tech } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Capture",
  description: "Analytics for the good ones",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const archivo = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-head",
});

const share_tech = Share_Tech({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`font-sans ${share_tech.variable} ${archivo.variable}`}
    >
      <body>
        <TRPCReactProvider>
          <main className="mx-auto min-h-dvh max-w-5xl p-4">{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
