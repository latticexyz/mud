import { PublicClient, Address } from "viem";
import { MUDError } from "@latticexyz/common/errors";

export async function setInternalFeePerGas(
  publicClient: PublicClient,
  address: Address
): Promise<{
  maxPriorityFeePerGas: bigint | undefined;
  maxFeePerGas: bigint | undefined;
  gasPrice: bigint | undefined;
}> {
  const balance = await publicClient.getBalance({
    address,
  });
  let maxPriorityFeePerGas: bigint | undefined;

  const feesPerGas = await publicClient.estimateFeesPerGas();

  if (feesPerGas.maxFeePerGas !== undefined) {
    if (feesPerGas.maxFeePerGas > 0 && balance === 0n) {
      throw new MUDError(`Attempting to deploy to a chain with non-zero base fee with an account that has no balance.
    If you're deploying to the Lattice testnet, you can fund your account by running 'pnpm mud faucet --address ${address}'`);
    }
    // Set the priority fee to 0 for development chains with no base fee, to allow transactions from unfunded wallets
    maxPriorityFeePerGas = feesPerGas.maxFeePerGas === 0n ? 0n : feesPerGas.maxPriorityFeePerGas;
  } else if (feesPerGas.gasPrice !== undefined) {
    // Legacy chains with gasPrice instead of maxFeePerGas
    if (feesPerGas.gasPrice > 0 && balance === 0n) {
      throw new MUDError(
        `Attempting to deploy to a chain with non-zero gas price with an account that has no balance.`
      );
    }
  } else {
    throw new MUDError("Can not fetch fee data from RPC");
  }

  return {
    maxPriorityFeePerGas,
    maxFeePerGas: feesPerGas.maxFeePerGas,
    gasPrice: feesPerGas.gasPrice,
  };
}
