import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { WalletProvider } from "@/components/providers/wallet-provider";

export const metadata: Metadata = {
  title: "Next.js Template",
  description: "Starter Next.js application",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
