import { Page } from "@playwright/test";
import { IWorld } from "../../contracts/types/ethers-contracts/IWorld";

type Args<Method extends keyof IWorld> = IWorld[Method] extends (...args: any) => any
  ? Parameters<IWorld[Method]>
  : never;

export function callWorld<Method extends keyof IWorld>(page: Page, method: Method, args: Args<Method>) {
  return page.evaluate(
    ([_method, _args]) => {
      return window["worldSend"](_method, _args)
        .then((tx) => tx.wait())
        .catch((e) => {
          throw new Error([`Error executing ${_method} with args:`, JSON.stringify(_args), e].join("\n\n"));
        });
    },
    [method, args]
  );
}
