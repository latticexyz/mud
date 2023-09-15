import chalk from "chalk";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/providers";
import { MUDError } from "@latticexyz/common/errors";
import { TxConfig } from "./types";

/**
 * Only await gas estimation (for speed), only execute if gas estimation succeeds (for safety)
 */
export async function fastTxExecute<
  C extends { connect: any; estimateGas: any; [key: string]: any },
  F extends keyof C
>(
  input: TxConfig & {
    nonce: number;
    contract: C;
    func: F;
    args: Parameters<C[F]>;
    confirmations: number;
  }
): Promise<TransactionResponse | TransactionReceipt> {
  const {
    func,
    args,
    contract,
    signer,
    nonce,
    maxPriorityFeePerGas,
    maxFeePerGas,
    gasPrice,
    confirmations = 1,
    debug,
  } = input;
  const functionName = `${func as string}(${args.map((arg) => `'${arg}'`).join(",")})`;
  try {
    const contractWithSigner = contract.connect(signer);
    const gasLimit = await contractWithSigner.estimateGas[func].apply(null, args);
    console.log(chalk.gray(`executing transaction: ${functionName} with nonce ${nonce}`));
    return contractWithSigner[func]
      .apply(null, [
        ...args,
        {
          gasLimit,
          nonce: nonce,
          maxPriorityFeePerGas: maxPriorityFeePerGas,
          maxFeePerGas: maxFeePerGas,
          gasPrice: gasPrice,
        },
      ])
      .then((tx: TransactionResponse) => {
        return confirmations === 0 ? tx : tx.wait(confirmations);
      });
  } catch (error: any) {
    if (debug) console.error(error);
    throw new MUDError(`Gas estimation error for ${functionName}: ${error?.reason}`);
  }
}
