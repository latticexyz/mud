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
// import { wait } from "@latticexyz/common/utils";

const queryClient = new QueryClient();
// const channel = new MessageChannel();

const root = ReactDOM.createRoot(document.querySelector("#react-root")!);
root.render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <EntryKitConfigProvider config={defineConfig({ chainId, worldAddress })}>
          <App />
          <AccountModal />
          {/* iframe:{" "}
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
          <br /> */}
          window:{" "}
          <button
            onClick={async () => {
              const url = new URL("https://smartpass.tunnel.offchain.dev");
              const bridge = window.open(url, "smartpass", "popup,width=600,height=400");
              if (!bridge) {
                throw new Error(`Could not open smartpass window at ${url}`);
              }

              const signal = AbortSignal.timeout(5000);
              const connected = new Promise<MessagePort>((resolve, reject) => {
                const timer = setInterval(() => {
                  const channel = new MessageChannel();
                  channel.port1.addEventListener("message", (event) => {
                    if (event.data === "bridge:connected" && event.currentTarget instanceof MessagePort) {
                      clearInterval(timer);
                      resolve(event.currentTarget);
                      // TODO: remove event listener?
                    }
                  });
                  channel.port1.start();
                  bridge.postMessage("bridge:connect", url.origin, [channel.port2]);
                }, 100);

                if (signal.aborted) {
                  reject(signal.reason);
                }

                signal.addEventListener(
                  "abort",
                  () => {
                    clearInterval(timer);
                    reject(signal.reason);
                  },
                  { once: true },
                );
              });

              const port = await connected;
              console.log("ready!");

              const id = 0;
              const reply = new Promise((resolve) => {
                port.addEventListener("message", (event) => {
                  if (event.data.id === id) {
                    resolve(event.data);
                  }
                });
                port.postMessage({ id, method: "create" });
              });

              console.log("reply", await reply);
            }}
          >
            create
          </button>
        </EntryKitConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);

// const iframe = document.createElement("iframe");
// iframe.allow = "publickey-credentials-get *; publickey-credentials-create *";
// iframe.src = "https://smartpass.tunnel.offchain.dev/";
// iframe.addEventListener("load", () => {
//   channel.port1.addEventListener("message", (event) => {
//     console.log("channel port1 message", event);
//   });
//   channel.port1.start();
//   iframe.contentWindow!.postMessage("bridge:connect", "*", [channel.port2]);
// });
// document.body.appendChild(iframe);
