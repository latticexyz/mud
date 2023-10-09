import {
  Abi,
  Account,
  Chain,
  Client,
  EncodeFunctionDataParameters,
  SendTransactionParameters,
  Transport,
  WriteContractParameters,
  WriteContractReturnType,
  concatHex,
  encodeFunctionData,
} from "viem";
import { debug as parentDebug } from "./debug";
import { parseAccount } from "viem/accounts";
import { sendTransaction } from "./sendTransaction";

const debug = parentDebug.extend("writeContract");

// TODO: migrate away from this approach once we can hook into viem's nonce management: https://github.com/wagmi-dev/viem/discussions/1230

export async function writeContract<
  TChain extends Chain | undefined,
  TAccount extends Account | undefined,
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends string,
  TChainOverride extends Chain | undefined
>(
  client: Client<Transport, TChain, TAccount>,
  {
    address,
    abi,
    functionName,
    args,
    dataSuffix,
    ...request
  }: WriteContractParameters<TAbi, TFunctionName, TChain, TAccount, TChainOverride>
): Promise<WriteContractReturnType> {
  const account_ = request.account ?? client.account;
  if (!account_) {
    // TODO: replace with viem AccountNotFoundError once its exported
    throw new Error("No account provided");
  }
  const account = parseAccount(account_);

  const data = encodeFunctionData({
    abi,
    functionName,
    args,
  } as unknown as EncodeFunctionDataParameters<TAbi, TFunctionName>);

  debug("calling", functionName, "at", address);
  return await sendTransaction(client, {
    ...request,
    account,
    to: address,
    data: concatHex([data, dataSuffix ?? "0x"]),
  } as unknown as SendTransactionParameters<TChain, TAccount, TChainOverride>);
}
