import { Page } from "@playwright/test";
import IWorldAbi from "../../contracts/abi/IWorld.sol/IWorld.abi.json";
import { GetContractReturnType, PublicClient, WalletClient } from "viem";
import { AbiParametersToPrimitiveTypes, ExtractAbiFunction, ExtractAbiFunctionNames } from "abitype";

type WorldAbi = typeof IWorldAbi;

type WorldContract = GetContractReturnType<WorldAbi, PublicClient, WalletClient>;

type WriteMethodName = ExtractAbiFunctionNames<WorldAbi>;
type WriteMethod<TMethod extends WriteMethodName> = ExtractAbiFunction<WorldAbi, TMethod>;
type WriteArgs<TMethod extends WriteMethodName> = AbiParametersToPrimitiveTypes<WriteMethod<TMethod>["inputs"]>;

export function callWorld<TMethod extends WriteMethodName>(page: Page, method: TMethod, args?: WriteArgs<TMethod>) {
  return page.evaluate(
    ([_method, _args]) => {
      const worldContract = (window as any).worldContract as WorldContract;
      const writeMethod = worldContract.write[_method as any];
      return writeMethod(_args)
        .then((tx) => window["waitForTransaction"](tx))
        .catch((error) => {
          console.error(error);
          throw new Error([`Error executing ${_method} with args:`, JSON.stringify(_args), error].join("\n\n"));
        });
    },
    [method, args]
  );
}
