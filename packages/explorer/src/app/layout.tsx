import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { Navigation } from "../components/Navigation";
import { Providers } from "./Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "World Explorer",
  description: "World Explorer is a tool for visually exploring and manipulating the state of worlds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrains.variable} dark`}>
        <Providers>
          <Theme>
            <div
              className="container"
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
              }}
            >
              <Navigation />
              {children}
            </div>
            <Toaster richColors />
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
