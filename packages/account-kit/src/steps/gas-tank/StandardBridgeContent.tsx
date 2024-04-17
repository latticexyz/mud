import { useState } from "react";
import { encodeFunctionData, parseEther } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { AccountModalSection } from "../../AccountModalSection";
import { Button } from "../../ui/Button";
import { useConfig } from "../../AccountKitProvider";
import OptimismPortalAbi from "../../abis/OptimismPortal.json";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { OPTIMISM_PORTAL_ADDRESS } from "./constants";
import { useDepositQuery } from "./hooks/useDepositQuery";

type StandardBridgeContentProps = {
  amount: string;
  sourceChainId: number;
};

export function StandardBridgeContent({ amount, sourceChainId }: StandardBridgeContentProps) {
  const wallet = useWalletClient();
  const { gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;

  const [tx] = useState<string | null>(null); // TODO: remove this
  const { writeContractAsync } = useDepositQuery();

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
