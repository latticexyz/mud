import "tailwindcss/tailwind.css";

import { Metadata } from "next";
import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import localFont from "next/font/local";

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
  title: "Redstone",
  description: "A super low-cost chain for games and autonomous worlds.",
  icons: "/icons/redstone.svg",
};

type Props = { children: ReactNode };

export default function Layout({ children }: Props) {
  return (
    <html lang="en">
      <body className={twMerge("bg-black text-white", supplyMono.variable)}>{children}</body>
    </html>
  );
}
