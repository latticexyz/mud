import { parseEther } from "viem";
import { useAccount, useSwitchChain, useConfig as useWagmiConfig, useWriteContract } from "wagmi";
import { useConfig } from "../../MUDAccountKitProvider";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { getGasTankBalanceQueryKey } from "../../useGasTankBalance";
import { waitForTransactionReceipt } from "wagmi/actions";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../ui/Button";
import { AccountModalContent } from "../../AccountModalContent";
import { useState } from "react";
import { RelayLinkContent } from "./RelayLinkContent";
import { StandardBridgeContent } from "./StandardBridgeContent";
import { useOnboardingSteps } from "../../useOnboardingSteps";

export function GasAllowanceContent() {
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

  // TODO: clean up, add TS
  const [depositMethod, setDepositMethod] = useState<string | undefined>();

  if (depositMethod === "relayLink") {
    return <RelayLinkContent />;
  } else if (depositMethod === "standardBridge") {
    return <StandardBridgeContent />;
  }

  return (
    <AccountModalContent>
      {error ? <div>{String(error)}</div> : null}

      {!depositMethod && (
        <div className="flex flex-col gap-2">
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
                  value: parseEther("0.01"),
                });
              }}
            >
              Deposit to gas tank
            </Button>
          )}

          {chain.sourceId != null && (
            <Button
              variant="secondary"
              onClick={() => {
                setDepositMethod("standardBridge");
              }}
            >
              Standard bridge
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              setDepositMethod("relayLink");
            }}
          >
            Relay.link
          </Button>
          <Button variant="secondary" disabled>
            Redstone ETH
          </Button>
        </div>
      )}
    </AccountModalContent>
  );
}
