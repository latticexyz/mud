import { encodeAbiParameters, stringToHex } from "viem";
import { ModuleInput } from "@latticexyz/world/internal";

export type DefineERC20ModuleInput = {
  namespace: string;
  name: string;
  symbol: string;
};

export function defineERC20Module({ namespace, name, symbol }: DefineERC20ModuleInput): ModuleInput {
  const erc20ModuleArgs = encodeAbiParameters(
    [{ type: "bytes14" }, { type: "string" }, { type: "string" }],
    [stringToHex(namespace, { size: 14 }), name, symbol],
  );

  return {
    artifactPath: "@latticexyz/world-module-erc20/out/ERC20Module.sol/ERC20Module.json",
    root: false,
    args: [
      {
        type: "bytes",
        value: erc20ModuleArgs,
      },
    ],
  };
}
