import KeysWithValueModuleData from "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json" assert { type: "json" };
import KeysInTableModuleData from "@latticexyz/world-modules/out/KeysInTableModule.sol/KeysInTableModule.json" assert { type: "json" };
import UniqueEntityModuleData from "@latticexyz/world-modules/out/UniqueEntityModule.sol/UniqueEntityModule.json" assert { type: "json" };
import DelegationModuleData from "@latticexyz/world-modules/out/DelegationModule.sol/DelegationModule.json" assert { type: "json" };
import { Abi, Hex, size } from "viem";
import { findPlaceholders } from "./findPlaceholders";

// These modules are always deployed
export const defaultModuleContracts = [
  {
    name: "KeysWithValueModule",
    abi: KeysWithValueModuleData.abi as Abi,
    bytecode: KeysWithValueModuleData.bytecode.object as Hex,
    placeholders: findPlaceholders(KeysWithValueModuleData.bytecode.linkReferences),
    deployedBytecodeSize: size(KeysWithValueModuleData.deployedBytecode.object as Hex),
  },
  {
    name: "KeysInTableModule",
    abi: KeysInTableModuleData.abi as Abi,
    bytecode: KeysInTableModuleData.bytecode.object as Hex,
    placeholders: findPlaceholders(KeysInTableModuleData.bytecode.linkReferences),
    deployedBytecodeSize: size(KeysInTableModuleData.deployedBytecode.object as Hex),
  },
  {
    name: "UniqueEntityModule",
    abi: UniqueEntityModuleData.abi as Abi,
    bytecode: UniqueEntityModuleData.bytecode.object as Hex,
    placeholders: findPlaceholders(UniqueEntityModuleData.bytecode.linkReferences),
    deployedBytecodeSize: size(UniqueEntityModuleData.deployedBytecode.object as Hex),
  },
  {
    name: "DelegationModule",
    abi: DelegationModuleData.abi as Abi,
    bytecode: DelegationModuleData.bytecode.object as Hex,
    placeholders: findPlaceholders(DelegationModuleData.bytecode.linkReferences),
    deployedBytecodeSize: size(DelegationModuleData.deployedBytecode.object as Hex),
  },
];
