import { Hex, formatEther, parseEther } from "viem";
import { type UseConfigReturnType, type UseWalletClientReturnType } from "wagmi";
import { getWalletClient, simulateContract } from "wagmi/actions";
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
  createRelayClient();

  const { request } = await simulateContract(config, {
    address: gasTankAddress,
    abi: GasTankAbi,
    functionName: "depositTo",
    args: [wallet.data!.account.address],
    value: parseEther(amount),
    account: wallet.data!.account,
  });

  const client = getClient();
  return client.actions.call({
    chainId,
    toChainId,
    txs: [request],
    wallet: wallet.data!,
    onProgress,
  });
};

export const fetchRelayLinkQuote = async ({
  config,
  chainId,
  toChainId,
  amount,
}: {
  config: UseConfigReturnType;
  chainId: number;
  toChainId: number;
  amount: string;
}) => {
  createRelayClient();

  const walletClient = await getWalletClient(config);
  const client = getClient();

  console.log(chainId, toChainId, amount, walletClient.account.address);

  const quote = await client.methods.getBridgeQuote({
    wallet: walletClient,
    chainId,
    toChainId,
    amount: parseEther(amount).toString(),
    currency: "eth",
    recipient: walletClient.account.address,
  });

  // <p>Time estimate: ~{quote?.breakdown?.[0]?.timeEstimate}s</p>
  // <p>Deposit gas (Holesky): {formatEther(BigInt(quote?.fees?.gas || 0))} ETH</p>
  // <p>Fill gas (Garnet): {formatEther(BigInt(quote?.fees?.relayerGas || 0))} ETH</p>
  // <p>Relay fee: {formatEther(BigInt(quote?.fees?.relayerService || 0))} ETH</p>
  const depositFee = BigInt(quote.fees?.gas);
  const fillFee = BigInt(quote.fees?.relayerGas);
  const relayFee = BigInt(quote.fees?.relayerService);

  return formatEther(depositFee + fillFee + relayFee);
};
