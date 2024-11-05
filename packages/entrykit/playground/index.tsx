import "./polyfills";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccountModal } from "../src/AccountModal";
import { EntryKitConfigProvider } from "../src/EntryKitConfigProvider";
import { defineConfig } from "../src/config/defineConfig";
import { wagmiConfig } from "./wagmiConfig";
import { chainId, worldAddress } from "./common";
import { App } from "./App";

const queryClient = new QueryClient();
const channel = new MessageChannel();

const root = ReactDOM.createRoot(document.querySelector("#react-root")!);
root.render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <EntryKitConfigProvider config={defineConfig({ chainId, worldAddress })}>
          <App />
          <AccountModal />
          iframe:{" "}
          <button
            onClick={() => {
              channel.port1.postMessage({ method: "create" });
            }}
          >
            create
          </button>
          <button
            onClick={() => {
              channel.port1.postMessage({ method: "sign", params: [{ hash: "0x" }] });
            }}
          >
            sign
          </button>
          <br />
          window:{" "}
          <button
            onClick={() => {
              window.open("https://smartpass.tunnel.offchain.dev", "passkey");
            }}
          >
            create
          </button>
        </EntryKitConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);

const iframe = document.createElement("iframe");
iframe.allow = "publickey-credentials-get *; publickey-credentials-create *";
iframe.src = "https://smartpass.tunnel.offchain.dev/";
iframe.addEventListener("load", () => {
  channel.port1.addEventListener("message", (event) => {
    console.log("channel port1 message", event);
  });
  channel.port1.start();
  iframe.contentWindow!.postMessage("bridge:connect", "*", [channel.port2]);
});
document.body.appendChild(iframe);
