import IBaseWorldAbi from "@latticexyz/world/out/IBaseWorld.sol/IBaseWorld.abi.json";
import IModuleAbi from "@latticexyz/world-modules/out/IModule.sol/IModule.abi.json";

export const worldAbi = [...IBaseWorldAbi, ...IModuleAbi] as const;

export type MudPackages = Record<string, { localPath: string }>;
