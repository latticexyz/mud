import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Toaster } from "sonner";
import { Theme } from "@radix-ui/themes";
import { Providers } from "./_providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Worlds Explorer",
  description: "Worlds Explorer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Theme>
            <div className="container">{children}</div>
            <Toaster richColors />
          </Theme>
        </Providers>
      </body>
    </html>
  );
}
