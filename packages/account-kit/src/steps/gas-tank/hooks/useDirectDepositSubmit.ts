import { parseEther } from "viem";
import { Config, useAccount } from "wagmi";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { useConfig } from "../../../AccountKitProvider";
import { WriteContractMutateAsync } from "wagmi/query";

export const useDirectDepositSubmit = (
  amount: string | undefined,
  writeContractAsync: WriteContractMutateAsync<Config>,
) => {
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const { chain, gasTankAddress } = useConfig();

  return () => {
    if (!userAccountAddress || !amount) return;

    return writeContractAsync({
      chainId: chain.id,
      address: gasTankAddress,
      abi: GasTankAbi,
      functionName: "depositTo",
      args: [userAccountAddress],
      value: parseEther(amount.toString()),
    });
  };
};
