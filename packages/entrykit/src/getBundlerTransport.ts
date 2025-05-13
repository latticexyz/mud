import { transactionQueue } from "@latticexyz/common/actions";
import { Chain, createClient, fallback, http, keccak256, stringToHex, webSocket } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { userOpExecutor } from "./quarry/transports/userOpExecutor";
import { wiresaw } from "./quarry/transports/wiresaw";

export function getBundlerTransport(chain: Chain) {
  const bundlerHttpUrl = chain.rpcUrls.bundler?.http[0];
  const wiresawWebSocketUrl = chain.rpcUrls.wiresaw?.webSocket?.[0];
  if (wiresawWebSocketUrl) {
    return wiresaw({ wiresaw: webSocket(wiresawWebSocketUrl), fallbackBundler: http(bundlerHttpUrl) });
  }

  const wiresawHttpUrl = chain.rpcUrls.wiresaw?.http[0];
  if (wiresawHttpUrl) {
    return wiresaw({ wiresaw: http(wiresawHttpUrl), fallbackBundler: http(bundlerHttpUrl) });
  }

  // TODO: bundler websocket
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
    });
  }

  throw new Error(`Chain ${chain.id} config did not include a bundler RPC URL.`);
}
