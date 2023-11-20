import KeysWithValueModuleData from "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json" assert { type: "json" };
import KeysInTableModuleData from "@latticexyz/world-modules/out/KeysInTableModule.sol/KeysInTableModule.json" assert { type: "json" };
import UniqueEntityModuleData from "@latticexyz/world-modules/out/UniqueEntityModule.sol/UniqueEntityModule.json" assert { type: "json" };
import { Abi, Hex, size } from "viem";

// These modules are always deployed
export const defaultModuleContracts = [
  {
    name: "KeysWithValueModule",
    abi: KeysWithValueModuleData.abi as Abi,
    bytecode: KeysWithValueModuleData.bytecode.object as Hex,
    deployedBytecodeSize: size(KeysWithValueModuleData.deployedBytecode.object as Hex),
  },
  {
    name: "KeysInTableModule",
    abi: KeysInTableModuleData.abi as Abi,
    bytecode: KeysInTableModuleData.bytecode.object as Hex,
    deployedBytecodeSize: size(KeysInTableModuleData.deployedBytecode.object as Hex),
  },
  {
    name: "UniqueEntityModule",
    abi: UniqueEntityModuleData.abi as Abi,
    bytecode: UniqueEntityModuleData.bytecode.object as Hex,
    deployedBytecodeSize: size(UniqueEntityModuleData.deployedBytecode.object as Hex),
  },
];
