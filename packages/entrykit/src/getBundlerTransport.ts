import { transactionQueue } from "@latticexyz/common/actions";
import { Chain, createClient, fallback, http, keccak256, stringToHex, webSocket } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { gasEstimator } from "./quarry/transports/gasEstimator";
import { userOpExecutor } from "./quarry/transports/userOpExecutor";

export function getBundlerTransport(chain: Chain) {
  const bundlerHttpUrl = chain.rpcUrls.bundler?.http[0];
  // TODO: bundler websocket
  const bundlerTransport = bundlerHttpUrl
    ? gasEstimator(http(bundlerHttpUrl))
    : chain.id === 31337
      ? userOpExecutor({
          executor: createClient({
            chain,
            transport: fallback([webSocket(), http()]),
            account: privateKeyToAccount(keccak256(stringToHex("local user op executor"))),
            pollingInterval: 10,
          }).extend(transactionQueue()),
        })
      : null;
  if (!bundlerTransport) {
    throw new Error(`Chain ${chain.id} config did not include a bundler RPC URL.`);
  }
  return bundlerTransport;
}
