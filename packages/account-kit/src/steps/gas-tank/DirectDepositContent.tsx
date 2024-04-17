import { parseEther } from "viem";
import { AccountModalSection } from "../../AccountModalSection";
import { useAccount, useConfig as useWagmiConfig, useWriteContract } from "wagmi";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { useConfig } from "../../AccountKitProvider";
import { getGasTankBalanceQueryKey } from "../../useGasTankBalance";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { Button } from "../../ui/Button";

type DirectDepositContentProps = {
  amount: string | undefined;
};

export function DirectDepositContent({ amount }: DirectDepositContentProps) {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const { chain, gasTankAddress } = useConfig();
  const { resetStep } = useOnboardingSteps();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const { writeContractAsync, isPending, error } = useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        if (receipt.status === "success") {
          queryClient.invalidateQueries({
            queryKey: getGasTankBalanceQueryKey({ chainId: chain.id, gasTankAddress, userAccountAddress }),
          });
          resetStep();
        }
      },
    },
  });

  const handleDeposit = async () => {
    if (!userAccountAddress || !amount) return;

    await writeContractAsync({
      chainId: chain.id,
      address: gasTankAddress,
      abi: GasTankAbi,
      functionName: "depositTo",
      args: [userAccountAddress],
      value: parseEther(amount.toString()),
    });
  };

  return (
    <AccountModalSection>
      <div className="flex flex-col gap-2">
        {error ? <div>{String(error)}</div> : null}

        <Button className="w-full" pending={!userAccountAddress || isPending} onClick={handleDeposit}>
          Deposit
        </Button>
      </div>
    </AccountModalSection>
  );
}
