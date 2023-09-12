import { tableIdToHex } from "@latticexyz/common";
import { CallData } from "../txHelpers";
import { System } from "./types";

export async function registerSystemCall(input: {
  systemContracts: Record<string, Promise<string>>;
  systemName: string;
  system: System;
  namespace: string;
}): Promise<CallData> {
  const { namespace, systemName, systemContracts, system } = input;
  const systemAddress = await systemContracts[systemName];
  return {
    func: "registerSystem",
    args: [tableIdToHex(namespace, system.name), systemAddress, system.openAccess],
  };
}
