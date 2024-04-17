import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useDepositQuery } from "./hooks/useDepositQuery";
import { AccountModalSection } from "../../AccountModalSection";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { useConfig } from "../../AccountKitProvider";
import { Button } from "../../ui/Button";

type DirectDepositContentProps = {
  amount: string | undefined;
};

export function DirectDepositContent({ amount }: DirectDepositContentProps) {
  const { chain, gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const { writeContractAsync, isPending, error } = useDepositQuery();

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
