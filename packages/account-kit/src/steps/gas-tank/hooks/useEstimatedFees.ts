import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import { useAccount, useEstimateGas, useGasPrice } from "wagmi";
import { useConfig } from "../../../AccountKitProvider";

export const useEstimatedFees = () => {
  const { chain, gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const gasPrice = useGasPrice();
  const estimateGas = useEstimateGas({
    chainId: chain.id,
    to: gasTankAddress,
    data: encodeFunctionData({
      abi: GasTankAbi,
      functionName: "depositTo",
      args: [userAccountAddress!],
    }),
    value: parseEther("0.01"),
  });

  let estimatedGasCost;
  if (gasPrice?.data && estimateGas?.data) {
    estimatedGasCost = formatEther(gasPrice.data * BigInt(1000) * estimateGas.data);
    estimatedGasCost = parseFloat(estimatedGasCost).toLocaleString("en", { minimumFractionDigits: 5 });
  }

  return estimatedGasCost;
};
