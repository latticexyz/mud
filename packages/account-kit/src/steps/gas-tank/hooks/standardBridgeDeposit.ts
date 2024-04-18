import { Hex, encodeFunctionData, parseEther } from "viem";
import { writeContract } from "wagmi/actions";
import { type UseWalletClientReturnType, type UseConfigReturnType } from "wagmi";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import OptimismPortalAbi from "../../../abis/OptimismPortal.json";
import { OPTIMISM_PORTAL_ADDRESS } from "../constants";

type Props = {
  config: UseConfigReturnType;
  wallet: UseWalletClientReturnType;
  chainId: number;
  userAccountAddress: Hex;
  gasTankAddress: Hex;
  amount: string;
};

export const standardBridgeDeposit = ({
  config,
  wallet,
  chainId,
  userAccountAddress,
  gasTankAddress,
  amount,
}: Props) => {
  const gasLimit = BigInt(1000000); // TODO: better gas limit config
  const amountWei = parseEther(amount);
  const data = encodeFunctionData({
    abi: GasTankAbi,
    functionName: "depositTo",
    args: [userAccountAddress],
  });

  return writeContract(config, {
    account: wallet.data.account,
    chainId,
    address: OPTIMISM_PORTAL_ADDRESS,
    abi: OptimismPortalAbi,
    functionName: "depositTransaction",
    args: [gasTankAddress, amountWei, gasLimit, false, data],
    value: amountWei,
  });
};
