import { useState } from "react";
import { Hex, encodeFunctionData, formatEther, parseEther } from "viem";
import { UseConfigReturnType, useAccount, useConfig as useWagmiConfig } from "wagmi";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { DepositMethod } from "../DepositContent";
import { estimateGas, getGasPrice } from "wagmi/actions";
import { useEffect } from "react";
import { useConfig } from "../../../AccountKitConfigProvider";
import { encodeFullNativeDeposit } from "./nativeDeposit";
import { OPTIMISM_PORTAL_ADDRESS } from "../common";
import { fetchRelayLinkQuote } from "./relayLinkDeposit";
import { usePaymaster } from "../../../usePaymaster";
import { DEFAULT_DEPOSIT_AMOUNT } from "../DepositContent";

const estimateDirectFee = async ({
  config,
  chainId,
  gasTankAddress,
  userAccountAddress,
}: {
  config: UseConfigReturnType;
  chainId: number;
  gasTankAddress: Hex;
  userAccountAddress: Hex;
}) => {
  const gasPrice = await getGasPrice(config, {
    chainId,
  });
  const gasEstimate = await estimateGas(config, {
    chainId,
    to: gasTankAddress,
    data: encodeFunctionData({
      abi: GasTankAbi,
      functionName: "depositTo",
      args: [userAccountAddress],
    }),
    // TODO: use default amounts
    value: parseEther(DEFAULT_DEPOSIT_AMOUNT.toString()),
  });

  let estimatedGasCost;
  if (gasPrice && gasEstimate) {
    estimatedGasCost = formatEther(gasPrice * BigInt(1000) * gasEstimate);
    estimatedGasCost = parseFloat(estimatedGasCost).toLocaleString("en", { minimumFractionDigits: 5 });
  }

  return estimatedGasCost;
};

const estimateNativeFee = async ({
  config,
  chainId,
  gasTankAddress,
  userAccountAddress,
}: {
  config: UseConfigReturnType;
  chainId: number;
  gasTankAddress: Hex;
  userAccountAddress: Hex;
}) => {
  const gasPrice = await getGasPrice(config, {
    chainId,
  });
  const gasEstimate = await estimateGas(config, {
    chainId,
    to: OPTIMISM_PORTAL_ADDRESS,
    data: encodeFullNativeDeposit({
      gasTankAddress,
      userAccountAddress,
      amount: parseEther(DEFAULT_DEPOSIT_AMOUNT.toString()).toString(),
    }),
    value: parseEther(DEFAULT_DEPOSIT_AMOUNT.toString()),
  });

  let estimatedGasCost;
  if (gasPrice && gasEstimate) {
    estimatedGasCost = formatEther(gasPrice * gasEstimate);
    estimatedGasCost = parseFloat(estimatedGasCost).toLocaleString("en", { minimumFractionDigits: 5 });
  }

  return estimatedGasCost;
};

export const useTransactionFees = (amount: number | undefined, depositMethod: DepositMethod) => {
  const [fees, setFees] = useState<string>("");
  const { chainId } = useConfig();
  const gasTank = usePaymaster("gasTank");
  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userAccountChainId = userAccount?.chain?.id;

  useEffect(() => {
    const fetchFees = async () => {
      if (!gasTank) {
        // TODO: implement non-gas tank flow
        console.warn("useTransactionFees expects a gas tank.");
        return;
      }

      let fees;
      if (depositMethod === "direct") {
        fees = await estimateDirectFee({
          config: wagmiConfig,
          chainId: userAccountChainId,
          gasTankAddress: gasTank.address,
          userAccountAddress,
        });

        setFees(fees);
      } else if (depositMethod === "native") {
        fees = await estimateNativeFee({
          config: wagmiConfig,
          chainId: userAccountChainId,
          gasTankAddress: gasTank.address,
          userAccountAddress,
        });

        setFees(fees);
      } else if (depositMethod === "relay") {
        fees = await fetchRelayLinkQuote({
          config: wagmiConfig,
          chainId: userAccountChainId!,
          toChainId: chainId,
          amount: amount || DEFAULT_DEPOSIT_AMOUNT,
        });

        setFees(fees);
      }
    };

    fetchFees();
  }, [amount, chainId, depositMethod, gasTank, userAccountAddress, userAccountChainId, wagmiConfig]);

  return {
    fees,
    transferTime: depositMethod === "direct" ? 5 : depositMethod === "native" ? 60 : 10,
  };
};
