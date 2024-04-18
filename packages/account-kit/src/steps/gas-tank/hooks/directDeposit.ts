import { type UseConfigReturnType } from "wagmi";
import { writeContract } from "wagmi/actions";
import { Hex, parseEther } from "viem";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";

type Props = {
  config: UseConfigReturnType;
  chainId: number;
  userAccountAddress: Hex;
  gasTankAddress: Hex;
  amount: string;
};

export const directDeposit = ({ config, chainId, userAccountAddress, gasTankAddress, amount }: Props) => {
  return writeContract(config, {
    chainId,
    address: gasTankAddress,
    abi: GasTankAbi,
    functionName: "depositTo",
    args: [userAccountAddress],
    value: parseEther(amount.toString()),
  });
};
