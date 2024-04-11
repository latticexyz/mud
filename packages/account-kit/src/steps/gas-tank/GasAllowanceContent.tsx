import { parseEther } from "viem";
import { useAccount, useConfig as useWagmiConfig, useWriteContract } from "wagmi";
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

export function GasAllowanceContent() {
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

  // TODO: clean up, add TS
  const [depositMethod, setDepositMethod] = useState<string | undefined>();

  if (depositMethod === "relayLink") {
    return <RelayLinkContent />;
  } else if (depositMethod === "standardBridge") {
    return <StandardBridgeContent />;
  }

  return (
    <AccountModalContent title="Fund Redstone balance">
      {error ? <div>{String(error)}</div> : null}

      {!depositMethod && (
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
          <Button
            variant="secondary"
            onClick={() => {
              setDepositMethod("standardBridge");
            }}
          >
            Standard bridge
          </Button>
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
