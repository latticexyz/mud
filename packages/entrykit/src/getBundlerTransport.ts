import { transactionQueue } from "@latticexyz/common/actions";
import { Chain, createClient, fallback, http, webSocket } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
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
            account: privateKeyToAccount(generatePrivateKey()),
            pollingInterval: 10,
          }).extend(transactionQueue()),
        })
      : null;
  if (!bundlerTransport) {
    throw new Error(`Chain ${chain.id} config did not include a bundler RPC URL.`);
  }
  return bundlerTransport;
}
