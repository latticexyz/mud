import { AccountModalContent } from "../../AccountModalContent";
import { useAccount, useSwitchChain, useConfig as useWagmiConfig, useWriteContract } from "wagmi";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { useConfig } from "../../MUDAccountKitProvider";
import { getGasTankBalanceQueryKey } from "../../useGasTankBalance";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { useOnboardingSteps } from "../../useOnboardingSteps";
import { Button } from "../../ui/Button";
import { parseEther } from "viem";

export function DirectDepositContent() {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const { chain, gasTankAddress } = useConfig();
  const { resetStep } = useOnboardingSteps();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const { switchChain, isPending: switchChainPending } = useSwitchChain();
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

  return (
    <AccountModalContent>
      <div className="flex flex-col gap-2">
        {error ? <div>{String(error)}</div> : null}

        {userAccount.chainId !== chain.id ? (
          <Button pending={switchChainPending} onClick={() => switchChain({ chainId: chain.id })}>
            Switch chain to deposit
          </Button>
        ) : (
          <Button
            pending={!userAccountAddress || isPending}
            onClick={async () => {
              if (!userAccountAddress) return;

              await writeContractAsync({
                chainId: chain.id,
                address: gasTankAddress,
                abi: GasTankAbi,
                functionName: "depositTo",
                args: [userAccountAddress],
                value: parseEther("0.01"), // TODO: amount input
              });
            }}
          >
            Deposit to gas tank
          </Button>
        )}
      </div>
    </AccountModalContent>
  );
}
