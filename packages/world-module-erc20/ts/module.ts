import { encodeAbiParameters, stringToHex } from "viem";

export default function createModuleConfig(namespace: string, name: string, symbol: string) {
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
