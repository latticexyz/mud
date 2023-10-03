import {
  Abi,
  Account,
  Address,
  Chain,
  GetContractParameters,
  GetContractReturnType,
  PublicClient,
  Transport,
  WalletClient,
  WriteContractParameters,
  getContract as viem_getContract,
} from "viem";
import { UnionOmit } from "./type-utils/common";
import { WriteContractOptions, writeContract } from "./writeContract";

// copied from viem because this isn't exported
// TODO: import from viem?
function getFunctionParameters(values: [args?: readonly unknown[], options?: object]): {
  args: readonly unknown[];
  options: object;
} {
  const hasArgs = values.length && Array.isArray(values[0]);
  const args = hasArgs ? values[0]! : [];
  const options = (hasArgs ? values[1] : values[0]) ?? {};
  return { args, options };
}

export type GetContractOptions<
  TTransport extends Transport,
  TAddress extends Address,
  TAbi extends Abi,
  TChain extends Chain,
  TAccount extends Account,
  TPublicClient extends PublicClient<TTransport, TChain>,
  TWalletClient extends WalletClient<TTransport, TChain, TAccount>
> = Required<GetContractParameters<TTransport, TChain, TAccount, TAbi, TPublicClient, TWalletClient, TAddress>> & {
  onWrite?: WriteContractOptions["onWrite"];
};

export function getContract<
  TTransport extends Transport,
  TAddress extends Address,
  TAbi extends Abi,
  TChain extends Chain,
  TAccount extends Account,
  TPublicClient extends PublicClient<TTransport, TChain>,
  TWalletClient extends WalletClient<TTransport, TChain, TAccount>
>({
  abi,
  address,
  publicClient,
  walletClient,
  onWrite,
}: GetContractOptions<
  TTransport,
  TAddress,
  TAbi,
  TChain,
  TAccount,
  TPublicClient,
  TWalletClient
>): GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress> {
  const contract = viem_getContract<TTransport, TAddress, TAbi, TChain, TAccount, TPublicClient, TWalletClient>({
    abi,
    address,
    publicClient,
    walletClient,
  }) as unknown as GetContractReturnType<Abi, PublicClient, WalletClient>;

  if (contract.write) {
    // Replace write calls with our own. Implemented ~the same as viem, but adds better handling of nonces (via queue + retries).
    contract.write = new Proxy(
      {},
      {
        get(_, functionName: string) {
          return (
            ...parameters: [
              args?: readonly unknown[],
              options?: UnionOmit<WriteContractParameters, "abi" | "address" | "functionName" | "args">
            ]
          ) => {
            const { args, options } = getFunctionParameters(parameters);
            return writeContract(walletClient, {
              abi,
              address,
              functionName,
              args,
              ...options,
              onWrite,
            } as unknown as WriteContractOptions<TAbi, typeof functionName, TChain, TAccount>);
          };
        },
      }
    );
  }

  return contract as unknown as GetContractReturnType<TAbi, TPublicClient, TWalletClient, TAddress>;
}
