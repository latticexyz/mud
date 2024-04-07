import { Button, Dialog, Flex } from "@radix-ui/themes";
import { parseEther } from "viem";
import { useAccount, useConfig, useWriteContract } from "wagmi";
import { useLoginConfig } from "./Context";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { getGasTankBalanceQueryKey } from "./useGasTankBalance";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";

export function GasAllowanceDialogContent() {
  const queryClient = useQueryClient();
  const wagmiConfig = useConfig();
  const { chainId, gasTankAddress } = useLoginConfig();
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
    <Dialog.Content>
      <Dialog.Title>Fund Redstone Balance</Dialog.Title>
      <Dialog.Description size="2" mb="4">
        Fund Redstone Balance description
      </Dialog.Description>

      {error ? <div>{String(error)}</div> : null}

      <Flex direction="column" gap="2">
        <Button
          loading={!userAccountAddress || isPending}
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
        <Button disabled>Relay.link</Button>
        <Button disabled>Redstone ETH</Button>
      </Flex>
    </Dialog.Content>
  );
}
