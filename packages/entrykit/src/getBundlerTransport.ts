import { transactionQueue } from "@latticexyz/common/actions";
import { Chain, Client, Transport, createClient, http, keccak256, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { userOpExecutor } from "./quarry/transports/userOpExecutor";

export function getBundlerTransport(client: Client<Transport, Chain>) {
  const bundlerHttpUrl = client.chain.rpcUrls.bundler?.http[0];
  // TODO: bundler websocket
  const bundlerTransport = bundlerHttpUrl
    ? http(bundlerHttpUrl)
    : client.chain.id === 31337
      ? userOpExecutor({
          executor: createClient({
            chain: client.chain,
            transport: () => ({ config: client.transport, request: client.request }),
            account: privateKeyToAccount(keccak256(stringToHex("local user op executor"))),
            pollingInterval: 10,
          }).extend(transactionQueue()),
        })
      : null;
  if (!bundlerTransport) {
    throw new Error(`Chain ${client.chain.id} config did not include a bundler RPC URL.`);
  }
  return bundlerTransport;
}
