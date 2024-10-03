import { useAccount, useConnectorClient } from "wagmi";
import { useConfig } from "../src/EntryKitConfigProvider";
import { http } from "viem";
import { getAction } from "viem/utils";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { createSmartAccountClient } from "permissionless/clients";
import { useAutoTopUp } from "./useAutoTopUp";

// const bundlerTransport = http("https://bundler.tunnel.offchain.dev");
const bundlerTransport = http("http://127.0.0.1:4337");

// const bundlerClient = createClient({
//   chain: anvil,
//   transport: bundlerTransport,
//   pollingInterval: 500,
// });

export function Connected() {
  const { address } = useAccount();
  useAutoTopUp({ address });

  const { chainId, worldAddress } = useConfig();
  const { data: connectorClient } = useConnectorClient({ chainId });

  return (
    <div>
      <button
        disabled={!connectorClient}
        onClick={async () => {
          if (!connectorClient) return;

          const client =
            connectorClient.account.type === "smart"
              ? createSmartAccountClient({
                  bundlerTransport,
                  client: connectorClient,
                  account: connectorClient.account,
                })
              : connectorClient;

          console.log("calling writeContract");

          const hash = await getAction(
            client,
            writeContract,
            "writeContract",
          )({
            chain: client.chain,
            account: client.account,
            address: worldAddress,
            abi: [
              {
                type: "function",
                name: "move",
                inputs: [
                  {
                    name: "x",
                    type: "int32",
                    internalType: "int32",
                  },
                  {
                    name: "y",
                    type: "int32",
                    internalType: "int32",
                  },
                ],
                outputs: [],
                stateMutability: "nonpayable",
              },
            ],
            functionName: "move",
            args: [1, 1],
          });

          console.log("got tx", hash);
          const receipt = waitForTransactionReceipt(client, { hash });
          console.log("got receipt", receipt);
        }}
      >
        Write contract
      </button>
    </div>
  );
}
