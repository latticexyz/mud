import { Metadata } from "next";
import { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "../lib/cn";

export const basierCircle = localFont({
  src: [
    {
      path: "../public/fonts/BasierCircle-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/BasierCircle-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/BasierCircle-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-basier-circle",
});

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

const berkeleyMono = localFont({
  src: "../public/fonts/BerkeleyMono-Regular.otf",
  preload: true,
  variable: "--font-berkeley-mono",
  fallback: ["ui-monospace"],
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
      <body className={cn("text-white font-sans", basierCircle.variable, supplyMono.variable, berkeleyMono.variable)}>
        {children}
      </body>
    </html>
  );
}
