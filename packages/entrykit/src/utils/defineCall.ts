import { Address, ContractFunctionParameters, Abi } from "viem";

export function defineCall<abi extends Abi | readonly unknown[]>(
  call: Omit<ContractFunctionParameters<abi>, "address"> & {
    to: Address;
    value?: bigint | undefined;
  },
) {
  return call;
}
