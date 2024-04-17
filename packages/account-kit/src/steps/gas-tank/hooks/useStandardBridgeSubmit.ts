import { encodeFunctionData, parseEther } from "viem";
import { Config, useWalletClient, useAccount } from "wagmi";
import { WriteContractMutateAsync } from "wagmi/query";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { useConfig } from "../../../AccountKitProvider";
import OptimismPortalAbi from "../../../abis/OptimismPortal.json";
import { OPTIMISM_PORTAL_ADDRESS } from "../constants";

export const useStandardBridgeSubmit = (
  amount: string | undefined,
  writeContractAsync: WriteContractMutateAsync<Config>,
) => {
  const wallet = useWalletClient();
  const { gasTankAddress } = useConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userAccountChainId = userAccount?.chain?.id;

  return () => {
    if (!wallet.data || !userAccountAddress || !amount || Number(amount) === 0) return;

    const gasLimit = BigInt(1_000_000); // TODO: better gas limit config
    const amountWei = parseEther(amount);
    const data = encodeFunctionData({
      abi: GasTankAbi,
      functionName: "depositTo",
      args: [userAccountAddress],
    });

    return writeContractAsync({
      account: wallet.data.account,
      chainId: userAccountChainId,
      address: OPTIMISM_PORTAL_ADDRESS,
      abi: OptimismPortalAbi,
      functionName: "depositTransaction",
      args: [gasTankAddress, amountWei, gasLimit, false, data],
      value: amountWei,
    });
  };
};
