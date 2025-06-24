import { Page } from "playwright";
import { GetContractReturnType, PublicClient, WalletClient } from "viem";
import { AbiParametersToPrimitiveTypes, ExtractAbiFunction, ExtractAbiFunctionNames } from "abitype";
import CallWithSignatureAbi from "@latticexyz/world-module-callwithsignature/out/CallWithSignatureSystem.sol/CallWithSignatureSystem.abi.json";

type CallWithSignatureAbi = typeof CallWithSignatureAbi;

type WorldContract = GetContractReturnType<CallWithSignatureAbi, PublicClient & WalletClient>;

type WriteMethodName = ExtractAbiFunctionNames<CallWithSignatureAbi>;
type WriteMethod<TMethod extends WriteMethodName> = ExtractAbiFunction<CallWithSignatureAbi, TMethod>;
type WriteArgs<TMethod extends WriteMethodName> = AbiParametersToPrimitiveTypes<WriteMethod<TMethod>["inputs"]>;

export function callWithSignature(page: Page, args?: WriteArgs<"callWithSignature">) {
  return page.evaluate(
    ([_args, _CallWithSignatureAbi]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walletClient = (window as any).walletClient as WalletClient;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worldContract = (window as any).worldContract as WorldContract;

      return walletClient
        .writeContract({
          address: worldContract.address,
          abi: _CallWithSignatureAbi,
          functionName: "callWithSignature",
          args: _args,
        })
        .then((tx) => window["waitForTransaction"](tx))
        .catch((error) => {
          console.error(error);
          throw new Error([`Error executing callWithSignature with args:`, JSON.stringify(_args), error].join("\n\n"));
        });
    },
    [args, CallWithSignatureAbi],
  );
}
