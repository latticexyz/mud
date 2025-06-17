import { transactionQueue } from "@latticexyz/common/actions";
import { Chain, createClient, fallback, http, keccak256, stringToHex, webSocket } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { userOpExecutor } from "./quarry/transports/userOpExecutor";
import { wiresaw } from "@latticexyz/common/internal";

export function getBundlerTransport(chain: Chain) {
  if ("wiresaw" in chain.rpcUrls) {
    return wiresaw();
  }

  // TODO: bundler websocket
  const bundlerHttpUrl = chain.rpcUrls.bundler?.http[0];
  if (bundlerHttpUrl) {
    return http(bundlerHttpUrl);
  }

  if (chain.id === 31337) {
    return userOpExecutor({
      executor: createClient({
        chain,
        transport: fallback([webSocket(), http()]),
        account: privateKeyToAccount(keccak256(stringToHex("local user op executor"))),
        pollingInterval: 10,
      }).extend(transactionQueue()),
      fallbackDefaultTransport: http(),
    });
  }

  throw new Error(`Chain ${chain.id} config did not include a bundler RPC URL.`);
}
