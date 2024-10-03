import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useConfig } from "../src/EntryKitConfigProvider";
import { useAutoTopUp } from "./useAutoTopUp";

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
