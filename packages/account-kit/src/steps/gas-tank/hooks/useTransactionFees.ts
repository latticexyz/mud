import { useState } from "react";
import { Hex, encodeFunctionData, formatEther, parseEther } from "viem";
import { UseConfigReturnType, useAccount, useConfig as useWagmiConfig } from "wagmi";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { DepositMethod } from "../DepositContent";
import { estimateGas, getGasPrice } from "wagmi/actions";
import { useEffect } from "react";
import { useConfig } from "../../../AccountKitProvider";
import { encodeFullNativeDeposit } from "./nativeDeposit";
import { OPTIMISM_PORTAL_ADDRESS } from "../constants";
import { fetchRelayLinkQuote } from "./relayLinkDeposit";

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
    value: parseEther("0.01"),
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
      amount: parseEther("0.01").toString(),
    }),
    value: parseEther("0.01"),
  });

  let estimatedGasCost;
  if (gasPrice && gasEstimate) {
    estimatedGasCost = formatEther(gasPrice * gasEstimate);
    estimatedGasCost = parseFloat(estimatedGasCost).toLocaleString("en", { minimumFractionDigits: 5 });
  }

  return estimatedGasCost;
};

export const useTransactionFees = (amount: string, depositMethod: DepositMethod) => {
  const [fees, setFees] = useState<string>("");
  const { chain, gasTankAddress } = useConfig();
  const wagmiConfig = useWagmiConfig();
  const userAccount = useAccount();
  const userAccountAddress = userAccount.address;
  const userAccountChainId = userAccount?.chain?.id;

  useEffect(() => {
    const fetchFees = async () => {
      let fees;
      if (depositMethod === "direct") {
        fees = await estimateDirectFee({
          config: wagmiConfig,
          chainId: userAccountChainId,
          gasTankAddress,
          userAccountAddress,
        });

        setFees(fees);
      } else if (depositMethod === "native") {
        fees = await estimateNativeFee({
          config: wagmiConfig,
          chainId: userAccountChainId,
          gasTankAddress,
          userAccountAddress,
        });

        setFees(fees);
      } else if (depositMethod === "relay") {
        fees = await fetchRelayLinkQuote({
          config: wagmiConfig,
          chainId: userAccountChainId!,
          toChainId: chain.id,
          amount: amount || "0.01",
        });

        setFees(fees);
      }
    };

    fetchFees();
  }, [amount, chain, depositMethod, gasTankAddress, userAccountAddress, userAccountChainId, wagmiConfig]);

  return {
    fees,
    transferTime: depositMethod === "direct" ? 5 : depositMethod === "native" ? 60 : 10,
  };
};
