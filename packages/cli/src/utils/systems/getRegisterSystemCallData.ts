import { resourceIdToHex } from "@latticexyz/common";
import { System } from "./types";
import { CallData } from "../utils/types";

export async function getRegisterSystemCallData(input: {
  systemContracts: Record<string, Promise<string>>;
  systemKey: string;
  system: System;
  namespace: string;
}): Promise<CallData> {
  const { namespace, systemContracts, systemKey, system } = input;
  const systemAddress = await systemContracts[systemKey];
  return {
    func: "registerSystem",
    args: [resourceIdToHex({ type: "system", namespace, name: system.name }), systemAddress, system.openAccess],
  };
}
