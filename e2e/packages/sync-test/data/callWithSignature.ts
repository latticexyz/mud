import { Page } from "@playwright/test";
import { GetContractReturnType, PublicClient, WalletClient } from "viem";
import { AbiParametersToPrimitiveTypes, ExtractAbiFunction, ExtractAbiFunctionNames } from "abitype";

const Abi = [
  {
    type: "function",
    name: "callWithSignature",
    inputs: [
      {
        name: "delegator",
        type: "address",
        internalType: "address",
      },
      {
        name: "systemId",
        type: "bytes32",
        internalType: "ResourceId",
      },
      {
        name: "callData",
        type: "bytes",
        internalType: "bytes",
      },
      {
        name: "signature",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
] as const;

type DelegationAbi = typeof Abi;

type WorldContract = GetContractReturnType<DelegationAbi, PublicClient, WalletClient>;

type WriteMethodName = ExtractAbiFunctionNames<DelegationAbi>;
type WriteMethod<TMethod extends WriteMethodName> = ExtractAbiFunction<DelegationAbi, TMethod>;
type WriteArgs<TMethod extends WriteMethodName> = AbiParametersToPrimitiveTypes<WriteMethod<TMethod>["inputs"]>;

export function callWithSignature(page: Page, args?: WriteArgs<"callWithSignature">) {
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
              name: "callWithSignature",
              inputs: [
                {
                  name: "delegator",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "systemId",
                  type: "bytes32",
                  internalType: "ResourceId",
                },
                {
                  name: "callData",
                  type: "bytes",
                  internalType: "bytes",
                },
                {
                  name: "signature",
                  type: "bytes",
                  internalType: "bytes",
                },
              ],
              outputs: [],
              stateMutability: "payable",
            },
          ],
          functionName: "callWithSignature",
          args: _args,
        })
        .then((tx) => window["waitForTransaction"](tx))
        .catch((error) => {
          console.error(error);
          throw new Error([`Error executing callWithSignature with args:`, JSON.stringify(_args), error].join("\n\n"));
        });
    },
    [args],
  );
}
