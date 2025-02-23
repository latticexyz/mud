import { transactionQueue } from "@latticexyz/common/actions";
import { Chain, Client, Transport, createClient, http, keccak256, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { userOpExecutor } from "./quarry/transports/userOpExecutor";
import { wiresaw } from "./quarry/transports/wiresaw";

export function getBundlerTransport(client: Client<Transport, Chain>) {
  const bundlerHttpUrl = client.chain.rpcUrls.bundler?.http[0];
  // TODO: bundler websocket
  // TODO: do chain checks/conditionals inside the transports
  const bundlerTransport = bundlerHttpUrl
    ? client.chain.id === 17420
      ? wiresaw(http(bundlerHttpUrl))
      : client.chain.id === 690 || client.chain.id === 17069
        ? alto(http(bundlerHttpUrl))
        : http(bundlerHttpUrl)
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

function alto<transport extends Transport>(createTransport: transport): transport {
  return ((opts) => {
    const transport = createTransport(opts);
    const request: typeof transport.request = async (req) => {
      if (req.method === "eth_sendUserOperation") {
        const { transactionHash, userOpHash } = await transport.request({
          ...req,
          method: "pimlico_sendUserOperationNow",
        });
        return userOpHash;
      }

      if (req.method === "eth_estimateUserOperationGas") {
        try {
          return await transport.request(req);
        } catch (error) {
          // fill in missing error data from alto so viem can parse the error
          error.data ??= error.details;
          throw error;
        }
      }

      return transport.request(req);
    };
    return {
      ...transport,
      request,
    };
  }) as transport;
}
