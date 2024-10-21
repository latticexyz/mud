import { encodeAbiParameters, stringToHex } from "viem";

export type DefineERC20ConfigInput = {
  namespace: string;
  name: string;
  symbol: string;
};

export function defineERC20Config({ namespace, name, symbol }: DefineERC20ConfigInput) {
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
