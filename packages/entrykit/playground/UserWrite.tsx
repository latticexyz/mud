import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useEntryKitConfig } from "@latticexyz/entrykit/internal";

export function UserWrite() {
  const { chainId, worldAddress } = useEntryKitConfig();

  const { writeContractAsync, data: hash } = useWriteContract();
  const { data: receipt } = useWaitForTransactionReceipt({ hash });

  return (
    <div>
      <button
        onClick={async () => {
          console.log("writing from user");

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
        User write
      </button>
      <br />
      tx: {hash ?? "??"} ({receipt?.status ?? "??"})
    </div>
  );
}
