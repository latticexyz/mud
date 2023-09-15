import { BigNumber, Wallet } from "ethers";
import { MUDError } from "@latticexyz/common/errors";

/**
 * Set the maxFeePerGas and maxPriorityFeePerGas based on the current base fee and the given multiplier.
 * The multiplier is used to allow replacing pending transactions.
 * @param multiplier Multiplier to apply to the base fee
 */
export async function setInternalFeePerGas(
  signer: Wallet,
  multiplier: number
): Promise<{
  maxPriorityFeePerGas: number | undefined;
  maxFeePerGas: BigNumber | undefined;
  gasPrice: BigNumber | undefined;
}> {
  // Compute maxFeePerGas and maxPriorityFeePerGas like ethers, but allow for a multiplier to allow replacing pending transactions
  const feeData = await signer.provider.getFeeData();
  let maxPriorityFeePerGas: number | undefined;
  let maxFeePerGas: BigNumber | undefined;
  let gasPrice: BigNumber | undefined;

  if (feeData.lastBaseFeePerGas) {
    if (!feeData.lastBaseFeePerGas.eq(0) && (await signer.getBalance()).eq(0)) {
      throw new MUDError(`Attempting to deploy to a chain with non-zero base fee with an account that has no balance.
        If you're deploying to the Lattice testnet, you can fund your account by running 'pnpm mud faucet --address ${await signer.getAddress()}'`);
    }

    // Set the priority fee to 0 for development chains with no base fee, to allow transactions from unfunded wallets
    maxPriorityFeePerGas = feeData.lastBaseFeePerGas.eq(0) ? 0 : Math.floor(1_500_000_000 * multiplier);
    maxFeePerGas = feeData.lastBaseFeePerGas.mul(2).add(maxPriorityFeePerGas);
  } else if (feeData.gasPrice) {
    // Legacy chains with gasPrice instead of maxFeePerGas
    if (!feeData.gasPrice.eq(0) && (await signer.getBalance()).eq(0)) {
      throw new MUDError(
        `Attempting to deploy to a chain with non-zero gas price with an account that has no balance.`
      );
    }

    gasPrice = feeData.gasPrice;
  } else {
    throw new MUDError("Can not fetch fee data from RPC");
  }
  return {
    maxPriorityFeePerGas,
    maxFeePerGas,
    gasPrice,
  };
}
