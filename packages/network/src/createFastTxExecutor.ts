import { ArgumentsType } from "vitest";
import { BigNumber, Overrides, Signer } from "ethers";
import { JsonRpcProvider } from "@ethersproject/providers";

export async function createFastTxExecutor(
  signer: Signer & { provider: JsonRpcProvider },
  globalOptions: { priorityFeeMultiplier: number } = { priorityFeeMultiplier: 1.1 }
) {
  const chainId = await signer.getChainId();

  const currentNonce = {
    nonce: await signer.getTransactionCount(),
  };

  const gasConfig: {
    maxPriorityFeePerGas?: number;
    maxFeePerGas?: BigNumber;
  } = {};
  updateFeePerGas(globalOptions.priorityFeeMultiplier);

  /**
   * TODO: docs
   */
  async function fastTxExecute<
    C extends { estimateGas: any; populateTransaction: any; [key: string]: any },
    F extends keyof C
  >(
    contract: C,
    func: F,
    args: ArgumentsType<C[F]>,
    options: {
      retryCount?: number;
      debug?: boolean;
    } = { retryCount: 0, debug: false }
  ): Promise<{ hash: string; tx: ReturnType<C[F]> }> {
    const functionName = `${func as string}(${args.map((arg) => `'${arg}'`).join(",")})`;

    try {
      console.log(`executing transaction: ${functionName} with nonce ${currentNonce.nonce}`);
      const { argsWithoutOverrides, overrides } = separateOverridesFromArgs(args);

      const gasLimit = overrides.gasLimit ?? (await contract.estimateGas[func].apply(null, args));
      console.log(`gas limit: ${gasLimit}`);

      const fullOverrides = { type: 2, gasLimit, nonce: currentNonce.nonce++, ...gasConfig, ...overrides };

      // Populate the transaction
      console.log("populate");
      const populatedTx = await contract.populateTransaction[func](...argsWithoutOverrides, fullOverrides);
      populatedTx.chainId = chainId;
      console.log("done populate");

      // Execute tx
      let hash: string;
      try {
        // Attempt to sign the transaction and send it raw for higher performance
        console.log("sign");
        const signedTx = await signer.signTransaction(populatedTx);
        console.log("done sign");
        console.log("hash");
        hash = await signer.provider.perform("sendTransaction", {
          signedTransaction: signedTx,
        });
        console.log("done hash");
      } catch (e) {
        // Some signers don't support signing without sending (looking at you MetaMask),
        // so sign+send using the signer as a fallback
        console.warn("signing failed, falling back to sendTransaction", e);
        const tx = await signer.sendTransaction(populatedTx);
        hash = tx.hash;
      }

      // Return the transaction receipt
      const tx = signer.provider.getTransaction(hash) as ReturnType<C[F]>;
      return { hash, tx };
    } catch (error: any) {
      if (options.debug) console.error(error);

      // Handle "transaction already imported" errors
      if (error?.message.includes("transaction already imported")) {
        if (options.retryCount === 0) {
          // If the deployment failed because the transaction was already imported,
          // retry with a higher priority fee
          updateFeePerGas(globalOptions.priorityFeeMultiplier * 1.1);
          return fastTxExecute(contract, func, args, { retryCount: options.retryCount++ });
        } else throw new Error(`Gas estimation error for ${functionName}: ${error?.reason}`);
      }

      // Rethrow all other errors
      throw error;
    }
  }

  // const txPromise = contract[func].apply(null, [
  //   ...argsWithoutOverrides,
  //   // Overrides are applied last, so they can override all other options
  // ]);

  // return txPromise;

  /**
   * Set the maxFeePerGas and maxPriorityFeePerGas based on the current base fee and the given multiplier.
   * The multiplier is used to allow replacing pending transactions.
   * @param multiplier Multiplier to apply to the base fee
   */
  async function updateFeePerGas(multiplier: number) {
    // Compute maxFeePerGas and maxPriorityFeePerGas like ethers, but allow for a multiplier to allow replacing pending transactions
    const feeData = await signer.provider.getFeeData();
    if (!feeData.lastBaseFeePerGas) throw new Error("Can not fetch lastBaseFeePerGas from RPC");

    // Set the priority fee to 0 for development chains with no base fee, to allow transactions from unfunded wallets
    gasConfig.maxPriorityFeePerGas = feeData.lastBaseFeePerGas.eq(0) ? 0 : Math.floor(1_500_000_000 * multiplier);
    gasConfig.maxFeePerGas = feeData.lastBaseFeePerGas.mul(2).add(gasConfig.maxPriorityFeePerGas);
  }

  return {
    fastTxExecute,
    updateFeePerGas,
    gasConfig: gasConfig as Readonly<typeof gasConfig>,
    currentNonce: currentNonce as Readonly<typeof currentNonce>,
  };
}

function separateOverridesFromArgs<T>(args: Array<T>) {
  // Extract existing overrides from function call
  const hasOverrides = args.length > 0 && isOverrides(args[args.length - 1]);
  const overrides = (hasOverrides ? args[args.length - 1] : {}) as Overrides;
  const argsWithoutOverrides = hasOverrides ? args.slice(0, args.length - 1) : args;

  return { argsWithoutOverrides, overrides };
}

function isOverrides(obj: any): obj is Overrides {
  if (typeof obj !== "object" || Array.isArray(obj) || obj === null) return false;
  return (
    "gasLimit" in obj ||
    "gasPrice" in obj ||
    "maxFeePerGas" in obj ||
    "maxPriorityFeePerGas" in obj ||
    "nonce" in obj ||
    "type" in obj ||
    "accessList" in obj ||
    "customData" in obj ||
    "value" in obj ||
    "blockTag" in obj ||
    "from" in obj
  );
}
