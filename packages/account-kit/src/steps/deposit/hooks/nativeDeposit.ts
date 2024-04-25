import { Hex, encodeFunctionData, parseEther } from "viem";
import { writeContract } from "wagmi/actions";
import { type UseWalletClientReturnType, type UseConfigReturnType } from "wagmi";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import OptimismPortalAbi from "../../../abis/OptimismPortal.json";
import { OPTIMISM_PORTAL_ADDRESS } from "../common";

export const encodeNativeDeposit = (userAccountAddress: Hex) => {
  return encodeFunctionData({
    abi: GasTankAbi,
    functionName: "depositTo",
    args: [userAccountAddress],
  });
};

export const encodeFullNativeDeposit = ({
  gasTankAddress,
  userAccountAddress,
  amount,
}: {
  gasTankAddress: Hex;
  userAccountAddress: Hex;
  amount: string;
}) => {
  const gasLimit = BigInt(1000000); // TODO: better gas limit config
  const data = encodeNativeDeposit(userAccountAddress);

  return encodeFunctionData({
    abi: OptimismPortalAbi,
    functionName: "depositTransaction",
    args: [gasTankAddress, parseEther(amount), gasLimit, false, data],
  });
};

export const nativeDeposit = ({
  config,
  wallet,
  chainId,
  userAccountAddress,
  gasTankAddress,
  amount,
}: {
  config: UseConfigReturnType;
  wallet: UseWalletClientReturnType;
  chainId: number;
  userAccountAddress: Hex;
  gasTankAddress: Hex;
  amount: number;
}) => {
  const gasLimit = BigInt(1000000); // TODO: better gas limit config
  const data = encodeNativeDeposit(userAccountAddress);

  return writeContract(config, {
    account: wallet.data!.account,
    chainId,
    address: OPTIMISM_PORTAL_ADDRESS,
    abi: OptimismPortalAbi,
    functionName: "depositTransaction",
    args: [gasTankAddress, parseEther(amount.toString()), gasLimit, false, data],
    value: parseEther(amount.toString()),
  });
};
