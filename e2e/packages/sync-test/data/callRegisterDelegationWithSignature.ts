import { Page } from "@playwright/test";
import IWorldAbi from "../../contracts/out/IWorld.sol/IWorld.abi.json";
import { GetContractReturnType, PublicClient, WalletClient } from "viem";
import { AbiParametersToPrimitiveTypes, ExtractAbiFunction, ExtractAbiFunctionNames } from "abitype";

type WorldAbi = typeof IWorldAbi;

type WorldContract = GetContractReturnType<WorldAbi, PublicClient, WalletClient>;

type WriteMethodName = ExtractAbiFunctionNames<WorldAbi>;
type WriteMethod<TMethod extends WriteMethodName> = ExtractAbiFunction<WorldAbi, TMethod>;
type WriteArgs<TMethod extends WriteMethodName> = AbiParametersToPrimitiveTypes<WriteMethod<TMethod>["inputs"]>;

export function callRegisterDelegationWithSignature(page: Page, args?: WriteArgs<"registerDelegationWithSignature">) {
  return page.evaluate(
    ([_args]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletClient = (window as any).walletClient;
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
