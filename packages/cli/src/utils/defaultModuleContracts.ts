import KeysWithValueModuleData from "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json" assert { type: "json" };
import KeysInTableModuleData from "@latticexyz/world-modules/out/KeysInTableModule.sol/KeysInTableModule.json" assert { type: "json" };
import UniqueEntityModuleData from "@latticexyz/world-modules/out/UniqueEntityModule.sol/UniqueEntityModule.json" assert { type: "json" };
// eslint-disable-next-line max-len
import Unstable_CallWithSignatureModuleData from "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json" assert { type: "json" };
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
    name: "Unstable_CallWithSignatureModule",
    abi: Unstable_CallWithSignatureModuleData.abi as Abi,
    bytecode: Unstable_CallWithSignatureModuleData.bytecode.object as Hex,
    placeholders: findPlaceholders(Unstable_CallWithSignatureModuleData.bytecode.linkReferences),
    deployedBytecodeSize: size(Unstable_CallWithSignatureModuleData.deployedBytecode.object as Hex),
  },
];
