import KeysWithValueModuleAbi from "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.abi.json" assert { type: "json" };
import KeysWithValueModuleData from "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json" assert { type: "json" };
import KeysInTableModuleAbi from "@latticexyz/world-modules/out/KeysInTableModule.sol/KeysInTableModule.abi.json" assert { type: "json" };
import KeysInTableModuleData from "@latticexyz/world-modules/out/KeysInTableModule.sol/KeysInTableModule.json" assert { type: "json" };
import UniqueEntityModuleAbi from "@latticexyz/world-modules/out/UniqueEntityModule.sol/UniqueEntityModule.abi.json" assert { type: "json" };
import UniqueEntityModuleData from "@latticexyz/world-modules/out/UniqueEntityModule.sol/UniqueEntityModule.json" assert { type: "json" };
import { ContractCode } from "../utils/types";

// These modules are always deployed
export const defaultModuleContracts: ContractCode[] = [
  {
    name: "KeysWithValueModule",
    abi: KeysWithValueModuleAbi,
    bytecode: KeysWithValueModuleData.bytecode,
  },
  {
    name: "KeysInTableModule",
    abi: KeysInTableModuleAbi,
    bytecode: KeysInTableModuleData.bytecode,
  },
  {
    name: "UniqueEntityModule",
    abi: UniqueEntityModuleAbi,
    bytecode: UniqueEntityModuleData.bytecode,
  },
];
