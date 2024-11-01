import { transactionQueue } from "@latticexyz/common/actions";
import { Chain, createClient, fallback, http, webSocket } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { userOpExecutor } from "./transports/userOpExecutor";
import { gasEstimator } from "./transports/gasEstimator";
import { wiresaw } from "./transports/wiresaw";

export function getBundlerTransport(chain: Chain) {
  const bundlerHttpUrl = chain.rpcUrls.bundler?.http[0];
  const bundlerTransport = chain.rpcUrls.bundler?.http[0]
    ? wiresaw(gasEstimator(http(bundlerHttpUrl)))
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
