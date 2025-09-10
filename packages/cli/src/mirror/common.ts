import { mudDataDirectory } from "@latticexyz/world/node";
import { Address, Hex } from "viem";
import { DeployedSystem } from "../deploy/common";
import { StoreLog } from "@latticexyz/store";

export const mirrorPlansDirectory = `${mudDataDirectory}/mirror-plans`;

export type PlanStep =
  | { step: "mirror"; chainId: number; worldAddress: Address }
  | { step: "deploySystem"; system: DeployedSystem; bytecode: DeployedBytecode }
  | { step: "start:setRecords" }
  | { step: "setRecord"; record: Extract<StoreLog, { eventName: "Store_SetRecord" }>["args"] }
  | { step: "end:setRecords" };

export type DeployedBytecode = {
  address: Address;
  code: Hex;
  libraries: {
    offset: number;
    reference: DeployedBytecode;
  }[];
};
