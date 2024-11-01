import { Chain } from "viem";

export function getPaymasterAddress(chain: Chain) {
  const paymasterAddress =
    chain.contracts?.paymaster && "address" in chain.contracts.paymaster
      ? chain.contracts?.paymaster.address
      : undefined;
  if (!paymasterAddress) {
    throw new Error(`Chain ${chain.id} config did not include a paymaster contract address.`);
  }
  return paymasterAddress;
}
