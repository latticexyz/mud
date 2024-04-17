import { useState } from "react";
import { encodeFunctionData, parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useWriteContract, useConfig as useWagmiConfig, useAccount, useWalletClient } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";
import { AccountModalSection } from "../../AccountModalSection";
import { Button } from "../../ui/Button";
import { useConfig } from "../../AccountKitProvider";
import { getGasTankBalanceQueryKey } from "../../useGasTankBalance";
import OptimismPortalAbi from "../../abis/OptimismPortal.json";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { OPTIMISM_PORTAL_ADDRESS } from "./constants";
import { getExplorerUrl } from "./utils/getExplorerUrl";

type StandardBridgeContentProps = {
  amount: string;
  sourceChainId: number;
};

export function StandardBridgeContent({ amount, sourceChainId }: StandardBridgeContentProps) {
  const queryClient = useQueryClient();
  const wagmiConfig = useWagmiConfig();
  const wallet = useWalletClient();
  const { chain, gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const [tx, setTx] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract({
    mutation: {
      onSuccess: async (hash) => {
        setTx(getExplorerUrl(hash, sourceChainId));

        const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
        if (receipt.status === "success") {
          queryClient.invalidateQueries({
            queryKey: getGasTankBalanceQueryKey({ chainId: chain.id, gasTankAddress, userAccountAddress }),
          });
        }
      },
    },
  });

  const handleSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (!wallet.data || !userAccountAddress || !amount || Number(amount) === 0) return;

    const gasLimit = BigInt(1_000_000); // TODO: better gas limit config
    const amountWei = parseEther(amount);
    const data = encodeFunctionData({
      abi: GasTankAbi,
      functionName: "depositTo",
      args: [userAccountAddress],
    });

    await writeContractAsync({
      account: wallet.data.account,
      chainId: sourceChainId,
      address: OPTIMISM_PORTAL_ADDRESS,
      abi: OptimismPortalAbi,
      functionName: "depositTransaction",
      args: [gasTankAddress, amountWei, gasLimit, false, data],
      value: amountWei,
    });
  };

  return (
    <AccountModalSection>
      <form onSubmit={handleSubmit}>
        <div className="mt-[15px] w-full">
          <Button type="submit">Bridge to Redstone gas tank</Button>
        </div>

        {tx && (
          <div className="mt-[15px]">
            <a href={tx} target="_blank" rel="noopener noreferrer" className="underline">
              View transaction
            </a>
          </div>
        )}
      </form>
    </AccountModalSection>
  );
}
