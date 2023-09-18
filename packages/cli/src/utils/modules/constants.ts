import KeysWithValueModuleData from "@latticexyz/world/out/KeysWithValueModule.sol/KeysWithValueModule.json" assert { type: "json" };
import KeysInTableModuleData from "@latticexyz/world/out/KeysInTableModule.sol/KeysInTableModule.json" assert { type: "json" };
import UniqueEntityModuleData from "@latticexyz/world/out/UniqueEntityModule.sol/UniqueEntityModule.json" assert { type: "json" };
import BatchCallModuleData from "@latticexyz/world/out/BatchCallModule.sol/BatchCallModule.json" assert { type: "json" };
import { ContractCode } from "../utils/types";

// These modules are always deployed
export const defaultModuleContracts: ContractCode[] = [
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
  {
    name: "BatchCallModule",
    abi: BatchCallModuleData.abi,
    bytecode: BatchCallModuleData.bytecode,
  },
];
