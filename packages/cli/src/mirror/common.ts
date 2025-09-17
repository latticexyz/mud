import { mudDataDirectory } from "@latticexyz/world/node";
import { Address, Hex } from "viem";
import { DeployedSystem } from "../deploy/common";
import { StoreLog } from "@latticexyz/store";

export const mirrorPlansDirectory = `${mudDataDirectory}/mirror-plans`;

export type PlanStep =
  | { step: "deploySystem"; system: DeployedSystem; bytecode: DeployedBytecode }
  | { step: "setRecord"; record: Extract<StoreLog, { eventName: "Store_SetRecord" }>["args"] };

export type DeployedBytecode = {
  address: Address;
  initCode: Hex;
  libraries: {
    offset: number;
    reference: DeployedBytecode;
  }[];
};
