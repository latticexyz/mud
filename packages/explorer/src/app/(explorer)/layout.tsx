import type { Metadata } from "next";
import { PublicEnvScript } from "next-runtime-env";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { store } from "../../observer/store";
import "./globals.css";

// Reference to imported store observer so the listener is established when this component is used.
store;

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
  title: "Worlds Explorer",
  description: "Worlds Explorer is a tool for visually exploring and manipulating the state of worlds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const chainId = process.env.CHAIN_ID;
  // const chainName = process.env.CHAIN_NAME;
  // const rpcHttpUrl = process.env.RPC_HTTP_URL;
  // const rpcWsUrl = process.env.RPC_WS_URL;

  // console.log("chainId", chainId);
  // console.log("chainName", chainName);
  // console.log("rpcHttpUrl", rpcHttpUrl);
  // console.log("rpcWsUrl", rpcWsUrl);

  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} dark`}>
        <Theme appearance="dark">
          <div className="container">{children}</div>
          <Toaster richColors closeButton duration={10000} theme="dark" />
        </Theme>
      </body>
    </html>
  );
}
