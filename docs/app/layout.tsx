import { Metadata } from "next";
import { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "../lib/cn";

const supplyMono = localFont({
  src: "../public/fonts/PPSupplyMono-Regular.woff2",
  preload: true,
  variable: "--font-supply-mono",
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    '"Liberation Mono"',
    '"Courier New"',
    "monospace",
  ],
});

export const metadata: Metadata = {
  title: "MUD | Framework for onchain applications",
  description:
    // eslint-disable-next-line max-len
    "MUD provides you with the tools to build onchain applications and autonomous worlds, with a framework and protocol that simplifies development on Ethereum and other EVM chains.",
  icons: "/images/logos/circle/mud.svg",
  openGraph: {
    images: "/images/og-img-mud.png",
  },
};

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <html lang="en">
      <body className={cn("bg-mud text-white", supplyMono.variable)}>{children}</body>
    </html>
  );
}
