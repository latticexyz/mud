import chalk from "chalk";
import { MUDError } from "@latticexyz/common/errors";
import { Address, Abi, Hex, WalletClient, PublicClient, Account, TransactionReceipt } from "viem";
import { simulateContract, waitForTransactionReceipt, writeContract } from "viem/actions";

export async function fastTx(input: {
  maxPriorityFeePerGas: bigint | undefined;
  maxFeePerGas: bigint | undefined;
  gasPrice: bigint | undefined;
  nonce: number;
  walletClient: WalletClient;
  account: Account;
  address: Address;
  publicClient: PublicClient;
  args: any[];
  abi: Abi;
  functionName: string;
  debug: boolean;
  confirmations: number;
}): Promise<Hex | TransactionReceipt> {
  const {
    nonce,
    walletClient,
    account,
    address,
    publicClient,
    args,
    abi,
    functionName,
    debug,
    maxFeePerGas,
    maxPriorityFeePerGas,
    gasPrice,
    confirmations,
  } = input;
  try {
    const func = `${functionName as string}(${args.map((arg) => `'${arg}'`).join(",")})`;
    let gasSettings = {};
    if (gasPrice) gasSettings = { gasPrice };
    else if (maxFeePerGas && maxPriorityFeePerGas) gasSettings = { maxFeePerGas, maxPriorityFeePerGas };
    // Note - calling simulate with Viems internal nonce but writeContract with provided - this speeds things up
    const { request } = await simulateContract(publicClient, {
      ...gasSettings,
      abi,
      functionName,
      account,
      address,
      args: args,
    });
    const hash = await writeContract(walletClient, {
      ...request,
      chain: request.chain ?? null,
      nonce,
    });
    console.log(chalk.gray(`executing transaction: ${func} with nonce ${nonce}`));
    if (confirmations === 0) return hash;
    else {
      return waitForTransactionReceipt(publicClient, { confirmations, hash });
    }
  } catch (error: any) {
    if (debug) console.error(error.message);

    if (error?.message.includes("is higher than the next one expected")) {
      const delayMs = 100;
      // console.log(`Tx retry with nonce ${nonce}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return fastTx(input);
    } else throw new MUDError(`Tx error for ${functionName}: ${error?.reason}`);
  }
}
