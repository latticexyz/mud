import { tableIdToHex } from "@latticexyz/common";
import { CallData } from "../utils";
import { System } from "./types";

export async function grantAccess(input: {
  systems: System[];
  systemContracts: Record<string, Promise<string>>;
  namespace: string;
}): Promise<CallData[]> {
  const { systems, namespace, systemContracts } = input;
  const calls: CallData[] = [];
  for (const { name, accessListAddresses, accessListSystems } of systems) {
    // Grant access to addresses
    accessListAddresses.map(async (address) => calls.push(grantSystemAccess(name, namespace, address)));

    // Grant access to other systems
    accessListSystems.map(async (granteeSystem) =>
      calls.push(grantSystemAccess(name, namespace, await systemContracts[granteeSystem]))
    );
  }
  return calls;
}

export function grantSystemAccess(name: string, namespace: string, address: string): CallData {
  return {
    func: "grantAccess",
    args: [tableIdToHex(namespace, name), address],
  };
}
