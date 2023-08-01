import { Page } from "@playwright/test";
import { IWorld__factory } from "../../contracts/types/ethers-contracts/factories/IWorld__factory";
import { AbiParametersToPrimitiveTypes, ExtractAbiFunction, ExtractAbiFunctionNames } from "abitype";

type WorldAbi = typeof IWorld__factory.abi;
type Method = ExtractAbiFunctionNames<WorldAbi>;

type Args<TMethod extends Method> = AbiParametersToPrimitiveTypes<ExtractAbiFunction<WorldAbi, TMethod>["inputs"]>;

export function callWorld<TMethod extends Method>(page: Page, method: TMethod, args: Args<TMethod>) {
  return page.evaluate(
    ([_method, _args]) => {
      console.log(`worldContract.write.${_method}`);
      return (window as any).worldContract.write[_method](_args, { maxFeePerGas: 0n, maxPriorityFeePerGas: 0n })
        .then((tx) => window["waitForTransaction"](tx))
        .catch((e) => {
          throw new Error([`Error executing ${_method} with args:`, JSON.stringify(_args), e].join("\n\n"));
        });
    },
    [method, args]
  );
}
