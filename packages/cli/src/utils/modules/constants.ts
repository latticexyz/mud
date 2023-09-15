import { ContractCode } from "../utils";
import KeysWithValueModuleData from "@latticexyz/world/out/KeysWithValueModule.sol/KeysWithValueModule.json" assert { type: "json" };
import KeysInTableModuleData from "@latticexyz/world/out/KeysInTableModule.sol/KeysInTableModule.json" assert { type: "json" };
import UniqueEntityModuleData from "@latticexyz/world/out/UniqueEntityModule.sol/UniqueEntityModule.json" assert { type: "json" };

// These modules are always deployed
export const defaultModules: ContractCode[] = [
  {
    name: "KeysWithValueModule",
    abi: KeysWithValueModuleData.abi,
    bytecode: KeysWithValueModuleData.bytecode,
  },
  {
    name: "KeysInTableModule",
    abi: KeysInTableModuleData.abi,
    bytecode: KeysInTableModuleData.bytecode,
  },
  {
    name: "UniqueEntityModule",
    abi: UniqueEntityModuleData.abi,
    bytecode: UniqueEntityModuleData.bytecode,
  },
];
