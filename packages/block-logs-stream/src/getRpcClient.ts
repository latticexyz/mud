import { Chain, Client, ClientConfig, OneOf, createClient, http } from "viem";

// TODO: add fetch options (retry, etc.) to Chain variant?

export type GetRpcClientOptions = OneOf<
  | {
      /**
       * [viem `Client`][0] used for fetching logs from the RPC.
       *
       * [0]: https://viem.sh/docs/clients/custom
       */
      publicClient: Client;
    }
  | {
      /**
       * @internal
       */
      internal_clientOptions: Pick<ClientConfig, "pollingInterval"> & {
        /**
         * [viem `Chain`][0] configured with RPC URLs to use for fetching logs.
         *
         * [0]: https://viem.sh/docs/glossary/types#chain
         *
         */
        chain: Chain;
        /**
         * Validate `toBlock` for each fetched block range to handle potentially [unsynced load balanced RPCs][0].
         * This assumes the RPC supports atomic batches and may increase RPC load as it adds an RPC call per fetched block range.
         *
         * When `false`, calls the RPC with `eth_getLogs` for each block range.
         *
         * When `true`, calls the RPC with `[eth_getBlockByNumber, eth_getLogs]` for each block range.
         *
         * [0]: https://indexsupply.com/shovel/docs/#unsynchronized-ethereum-nodes
         *
         * @default false
         */
        validateBlockRange?: boolean;
      };
    }
>;

export function getRpcClient(opts: GetRpcClientOptions): Client {
  return (
    opts.publicClient ??
    createClient({
      chain: opts.internal_clientOptions.chain,
      // TODO: conditional websocket?
      transport: http(),
      pollingInterval: opts.internal_clientOptions.pollingInterval,
    })
  );
}
