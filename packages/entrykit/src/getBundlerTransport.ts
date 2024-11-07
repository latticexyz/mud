import { transactionQueue } from "@latticexyz/common/actions";
import { Chain, createClient, fallback, http, webSocket } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { wiresaw } from "@latticexyz/wiresaw/internal";
import { gasEstimator, userOpExecutor } from "@latticexyz/paymaster/internal";

export function getBundlerTransport(chain: Chain) {
  const bundlerHttpUrl = chain.rpcUrls.bundler?.http[0];
  // TODO: bundler websocket
  const bundlerTransport = bundlerHttpUrl
    ? gasEstimator(wiresaw(http(bundlerHttpUrl)))
    : chain.id === 31337
      ? userOpExecutor({
          executor: createClient({
            chain,
            transport: fallback([webSocket(), http()]),
            account: privateKeyToAccount(generatePrivateKey()),
          }).extend(transactionQueue()),
        })
      : null;
  if (!bundlerTransport) {
    throw new Error(`Chain ${chain.id} config did not include a bundler RPC URL.`);
  }
  return bundlerTransport;
}
