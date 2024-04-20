import "@rainbow-me/rainbowkit/styles.css";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme, midnightTheme } from "@rainbow-me/rainbowkit";
import { mudFoundry } from "@latticexyz/common/chains";
import { AccountButton } from "../src/exports";
import { AccountModal } from "../src/AccountModal";
import { AccountKitConfigProvider } from "../src/AccountKitConfigProvider";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [mudFoundry],
  pollingInterval: 1_000,
  transports: {
    [mudFoundry.id]: http(),
  },
});

const accountKitConfig = {
  chain: mudFoundry,
  worldAddress: "0x6906906906906906906906906906906906906906",
  erc4337: false,
} as const;

const root = ReactDOM.createRoot(document.querySelector("#react-root")!);
root.render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({ borderRadius: "none" }),
            darkMode: midnightTheme({ borderRadius: "none" }),
          }}
        >
          {/* Mount context and modal ourselves to avoid hot reloading issues */}
          <AccountKitConfigProvider config={accountKitConfig}>
            <AccountButton />
            <AccountModal />
          </AccountKitConfigProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
);
