// import { defineChain } from "viem";
import { env } from "next-runtime-env";
import { defineChain } from "viem";
import { anvil } from "viem/chains";
import { garnet, redstone, rhodolite } from "@latticexyz/common/chains";

console.log("env", env("NEXT_PUBLIC_CHAIN_NAME"));

// export const OPChainA = defineChain({
//   id: 901,
//   name: "OPChainA",
//   nativeCurrency: {
//     decimals: 18,
//     name: "Ether",
//     symbol: "ETH",
//   },
//   rpcUrls: {
//     default: {
//       http: ["http://127.0.0.1:9545"],
//       webSocket: ["ws://127.0.0.1:9545"],
//     },
//   },
// });

// export const OPChainB = defineChain({
//   id: 902,
//   name: "OPChainB",
//   nativeCurrency: {
//     decimals: 18,
//     name: "Ether",
//     symbol: "ETH",
//   },
//   rpcUrls: {
//     default: {
//       http: ["http://127.0.0.1:9546"],
//       webSocket: ["ws://127.0.0.1:9546"],
//     },
//   },
// });

// export const customDefinedChain = {
//   id: pro
// }

// console.log(process.env, process.env.NEXT_PUBLIC_ANALYTICS_ID);

export const constructCustomDefinedChain = () => {
  // console.log("process.env", process.env.CHAIN_ID, process.env.CHAIN_NAME, process.env.NEXT_PUBLIC_RPC_HTTP_URL);

  const chainId = env("NEXT_PUBLIC_CHAIN_ID");
  const chainName = env("NEXT_PUBLIC_CHAIN_NAME");
  const rpcHttpUrl = env("NEXT_PUBLIC_RPC_HTTP_URL");

  console.log("chainId", chainId);
  console.log("chainName", chainName);
  console.log("rpcHttpUrl", rpcHttpUrl);

  if (!chainId || !chainName || !rpcHttpUrl) {
    throw new Error("Missing environment variables");
  }

  return defineChain({
    id: Number(chainId),
    name: chainName,
    nativeCurrency: {
      decimals: 18,
      name: "Ether",
      symbol: "ETH",
    },
    rpcUrls: {
      default: {
        http: [rpcHttpUrl],
        // webSocket: [process.env.RPC_WS_URL], // TODO: add later
      },
    },
  });
};

const customDefinedChain = constructCustomDefinedChain();

export const internalNamespaces = ["world", "store", "metadata", "puppet", "erc20-puppet", "erc721-puppet"];

export const supportedChains = { anvil, rhodolite, garnet, redstone, customDefinedChain } as const;
export type supportedChains = typeof supportedChains;

export type supportedChainName = keyof supportedChains;
export type supportedChainId = supportedChains[supportedChainName]["id"];

export const chainIdToName = Object.fromEntries(
  Object.entries(supportedChains).map(([chainName, chain]) => [chain.id, chainName]),
) as Record<supportedChainId, supportedChainName>;

export function isValidChainId(chainId: unknown): chainId is supportedChainId {
  // return typeof chainId === "number" && chainId in chainIdToName;
  return true;
}

export function isValidChainName(name: unknown): name is supportedChainName {
  // return typeof name === "string" && name in supportedChains;
  return true;
}

export function validateChainId(chainId: unknown): asserts chainId is supportedChainId {
  // TODO: make conditional skipping
  // if (!isValidChainId(chainId)) {
  //   throw new Error(`Invalid chain ID. Supported chains are: ${Object.keys(chainIdToName).join(", ")}.`);
  // }
}

export function validateChainName(name: unknown): asserts name is supportedChainName {
  // TODO: make conditional skipping
  // if (!isValidChainName(name)) {
  //   throw new Error(`Invalid chain name. Supported chains are: ${Object.keys(supportedChains).join(", ")}.`);
  // }
}
