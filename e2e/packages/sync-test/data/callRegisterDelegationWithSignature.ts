import { Page } from "@playwright/test";
import { GetContractReturnType, PublicClient, WalletClient } from "viem";
import { AbiParametersToPrimitiveTypes, ExtractAbiFunction, ExtractAbiFunctionNames } from "abitype";

const DelegationAbi = [
  {
    type: "function",
    name: "registerDelegationWithSignature",
    inputs: [
      {
        name: "delegatee",
        type: "address",
        internalType: "address",
      },
      {
        name: "delegationControlId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "initCallData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "delegator",
        type: "address",
        internalType: "address",
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

type DelegationAbi = typeof DelegationAbi;

type WorldContract = GetContractReturnType<DelegationAbi, PublicClient, WalletClient>;

type WriteMethodName = ExtractAbiFunctionNames<DelegationAbi>;
type WriteMethod<TMethod extends WriteMethodName> = ExtractAbiFunction<DelegationAbi, TMethod>;
type WriteArgs<TMethod extends WriteMethodName> = AbiParametersToPrimitiveTypes<WriteMethod<TMethod>["inputs"]>;

export function callRegisterDelegationWithSignature(page: Page, args?: WriteArgs<"registerDelegationWithSignature">) {
  return page.evaluate(
    ([_args]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletClient = (window as any).walletClient as WalletClient;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worldContract = (window as any).worldContract as WorldContract;

      return walletClient
        .writeContract({
          address: worldContract.address,
          abi: [
            {
              type: "function",
              name: "registerDelegationWithSignature",
              inputs: [
                {
                  name: "delegatee",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "delegationControlId",
                  type: "bytes32",
                  internalType: "ResourceId",
                },
                {
                  name: "initCallData",
                  type: "bytes",
                  internalType: "bytes",
                },
                {
                  name: "delegator",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "signature",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [],
              stateMutability: "nonpayable",
            },
          ],
          functionName: "registerDelegationWithSignature",
          args: _args,
        })
        .then((tx) => window["waitForTransaction"](tx))
        .catch((error) => {
          console.error(error);
          throw new Error(
            [`Error executing registerDelegationWithSignature with args:`, JSON.stringify(_args), error].join("\n\n"),
          );
        });
    },
    [args],
  );
}
