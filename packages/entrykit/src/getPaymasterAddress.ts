import { Chain } from "viem";

export function getPaymasterAddress(chain: Chain) {
  const paymasterAddress =
    chain.contracts?.quarryPaymaster && "address" in chain.contracts.quarryPaymaster
      ? chain.contracts?.quarryPaymaster.address
      : undefined;
  if (!paymasterAddress) {
    throw new Error(`Chain ${chain.id} config did not include a \`quarryPaymaster\` contract address.`);
  }
  return paymasterAddress;
}
