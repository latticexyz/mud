import { z } from "zod";
import { indexerEnvSchema } from "./parseEnv";
import { GetRpcClientOptions } from "@latticexyz/block-logs-stream";
import { Chain, createClient, fallback, http, webSocket } from "viem";
import { isDefined } from "@latticexyz/common/utils";
import { getChainId } from "viem/actions";

export async function getClientOptions(env: z.infer<typeof indexerEnvSchema>): Promise<GetRpcClientOptions> {
  if (env.INTERNAL__VALIDATE_BLOCK_RANGE) {
    const rpcHttpUrl = env.RPC_HTTP_URL;
    if (!rpcHttpUrl) {
      throw new Error("Must provide RPC_HTTP_URL when using INTERNAL__VALIDATE_BLOCK_RANGE.");
    }

    const chainId = await getChainId(createClient({ transport: http(rpcHttpUrl) }));

    // Mock a chain config so we can use in client options
    const chain = {
      id: chainId,
      name: "Unknown",
      nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
      rpcUrls: { default: { http: [rpcHttpUrl] } },
    } satisfies Chain;

    return {
      internal_clientOptions: {
        chain,
        pollingInterval: env.POLLING_INTERVAL,
        validateBlockRange: env.INTERNAL__VALIDATE_BLOCK_RANGE,
      },
    };
  }

  const transport = fallback(
    [
      // prefer WS when specified
      env.RPC_WS_URL ? webSocket(env.RPC_WS_URL) : undefined,
      // otherwise use or fallback to HTTP
      env.RPC_HTTP_URL ? http(env.RPC_HTTP_URL) : undefined,
    ].filter(isDefined),
  );

  const publicClient = createClient({
    transport,
    pollingInterval: env.POLLING_INTERVAL,
  });

  return { publicClient };
}
