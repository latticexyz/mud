import { BigNumber, Contract, Overrides, Signer, providers } from "ethers";

/**
 * Create a stateful util to execute transactions as fast as possible.
 * Internal state includes the current nonce and the current gas price.
 *
 * Note: since the signer's nonce is managed in the internal state of this
 * function, using the same signer to send transactions outside of this function
 * or creating multiple instances of this function with the same signer will result
 * in nonce errors.
 */
export async function createFastTxExecutor(
  signer: Signer & { provider: providers.JsonRpcProvider },
  globalOptions: { priorityFeeMultiplier: number } = { priorityFeeMultiplier: 1 }
) {
  const chainId = await signer.getChainId();

  const currentNonce = {
    nonce: await signer.getTransactionCount(),
  };

  // This gas config is updated
  const gasConfig: {
    maxPriorityFeePerGas?: number;
    maxFeePerGas?: BigNumber;
  } = {};
  await updateFeePerGas(globalOptions.priorityFeeMultiplier);

  /**
   * Execute a transaction as fast as possible by skipping a couple unnecessary RPC calls ethers does.
   */
  async function fastTxExecute<C extends Contract, F extends keyof C>(
    contract: C,
    func: F,
    args: Parameters<C[F]>,
    options: {
      retryCount?: number;
    } = { retryCount: 0 }
  ): Promise<{ hash: string; tx: ReturnType<C[F]> }> {
    const functionName = `${func as string}(${args.map((arg) => `'${arg}'`).join(",")})`;
    console.log(`executing transaction: ${functionName} with nonce ${currentNonce.nonce}`);

    try {
      // Separate potential overrides from the args to extend the overrides below
      const { argsWithoutOverrides, overrides } = separateOverridesFromArgs(args);

      // Estimate gas if no gas limit was provided
      const gasLimit = overrides.gasLimit ?? (await contract.estimateGas[func as string].apply(null, args));

      // Apply default overrides
      const fullOverrides = { type: 2, gasLimit, nonce: currentNonce.nonce++, ...gasConfig, ...overrides };

      // Populate the transaction
      const populatedTx = await contract.populateTransaction[func as string](...argsWithoutOverrides, fullOverrides);
      populatedTx.chainId = chainId;

      // Execute the transaction
      let hash: string;
      try {
        // Attempt to sign the transaction and send it raw for higher performance
        const signedTx = await signer.signTransaction(populatedTx);
        hash = await signer.provider.perform("sendTransaction", {
          signedTransaction: signedTx,
        });
      } catch (e) {
        // Some signers don't support signing without sending (looking at you MetaMask),
        // so sign+send using the signer as a fallback
        console.warn("signing failed, falling back to sendTransaction", e);
        const tx = await signer.sendTransaction(populatedTx);
        hash = tx.hash;
      }

      // Return the transaction promise and transaction hash.
      // The hash is available immediately, the full transaction is available as a promise
      const tx = signer.provider.getTransaction(hash) as ReturnType<C[F]>;
      return { hash, tx };
    } catch (error: any) {
      // Handle "transaction already imported" errors
      if (error?.message.includes("transaction already imported")) {
        if (options.retryCount === 0) {
          updateFeePerGas(globalOptions.priorityFeeMultiplier * 1.1);
          return fastTxExecute(contract, func, args, { retryCount: options.retryCount++ });
        } else throw new Error(`Gas estimation error for ${functionName}: ${error?.reason}`);
      }

      // TODO: potentially handle more transaction errors here, like:
      // "insufficient funds for gas * price + value" -> request funds from faucet
      // "invalid nonce" -> update nonce

      // Rethrow all other errors
      throw error;
    }
  }

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
