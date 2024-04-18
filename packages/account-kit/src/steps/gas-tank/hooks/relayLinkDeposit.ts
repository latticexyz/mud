import { Hex, parseEther } from "viem";
import { type UseConfigReturnType, type UseWalletClientReturnType } from "wagmi";
import { simulateContract } from "wagmi/actions";
import { getClient } from "@reservoir0x/relay-sdk";
import GasTankAbi from "@latticexyz/gas-tank/out/IWorld.sol/IWorld.abi.json";
import { createRelayClient } from "../utils/createRelayClient";

type Props = {
  config: UseConfigReturnType;
  wallet: UseWalletClientReturnType;
  chainId: number;
  toChainId: number;
  gasTankAddress: Hex;
  amount: string;
  onProgress?: () => void;
};

export const relayLinkDeposit = async ({
  config,
  chainId,
  toChainId,
  gasTankAddress,
  wallet,
  amount,
  onProgress,
}: Props) => {
  if (!wallet.data) return;

  createRelayClient();

  const { request } = await simulateContract(config, {
    address: gasTankAddress,
    abi: GasTankAbi,
    functionName: "depositTo",
    args: [wallet.data.account.address],
    value: parseEther(amount),
    account: wallet.data.account,
  });

  const client = getClient();
  return client.actions.call({
    chainId,
    toChainId,
    txs: [request],
    wallet: wallet.data,
    onProgress,
  });
};
