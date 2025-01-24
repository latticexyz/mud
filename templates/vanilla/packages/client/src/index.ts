import "tailwindcss/tailwind.css";
import { mount } from "@latticexyz/entrykit/vanilla";
import { wagmiConfig } from "./wagmiConfig";
import { defineConfig } from "@latticexyz/entrykit/internal";
import { getChain, getWorldAddress } from "./common";

// TODO: figure out why mount types aren't showing up here
mount({
  wagmiConfig,
  entryKitConfig: defineConfig({
    chainId: getChain().id,
    worldAddress: getWorldAddress(),
    appName: document.title,
  }),
});

console.log("hello world");
