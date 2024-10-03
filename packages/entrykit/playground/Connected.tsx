import { useAccount, useConnectorClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
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

  const { writeContractAsync, data: hash } = useWriteContract();
  const { data: receipt } = useWaitForTransactionReceipt({ hash });

  return (
    <div>
      <button
        onClick={async () => {
          console.log("calling writeContract");

          const hash = await writeContractAsync({
            chainId,
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
        }}
      >
        Write contract
      </button>
      <br />
      tx: {hash ?? "??"} ({receipt?.status ?? "??"})
    </div>
  );
}
