import { parseEther } from "viem";
import { useAccount, useConfig as useWagmiConfig, useWriteContract } from "wagmi";
import { useConfig } from "./MUDAccountKitProvider";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { getGasTankBalanceQueryKey } from "./useGasTankBalance";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/Button";
import { ModalContent } from "./ui/ModalContent";

export function GasAllowanceDialogContent() {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const { chainId, gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const { writeContractAsync, isPending, error } = useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        if (receipt.status === "success") {
          queryClient.invalidateQueries({
            queryKey: getGasTankBalanceQueryKey({ chainId, gasTankAddress, userAccountAddress }),
          });
        }
      },
    },
  });

  return (
    <ModalContent title="Fund Redstone balance" description="TODO">
      {error ? <div>{String(error)}</div> : null}

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          pending={!userAccountAddress || isPending}
          onClick={async () => {
            if (!userAccountAddress) return;

            await writeContractAsync({
              chainId,
              address: gasTankAddress,
              abi: GasTankAbi,
              functionName: "depositTo",
              args: [userAccountAddress],
              value: parseEther("0.01"),
            });
          }}
        >
          Deposit to gas tank
        </Button>
        <Button variant="secondary" disabled>
          Relay.link
        </Button>
        <Button variant="secondary" disabled>
          Redstone ETH
        </Button>
      </div>
    </ModalContent>
  );
}
