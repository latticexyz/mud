import { System } from "./types";
import { CallData } from "../utils/types";
import { resourceToHex } from "@latticexyz/common";

export async function getGrantAccessCallData(input: {
  systems: System[];
  systemContracts: Record<string, Promise<string>>;
  namespace: string;
}): Promise<CallData[]> {
  const { systems, namespace, systemContracts } = input;
  const calls: CallData[] = [];
  for (const { name, accessListAddresses, accessListSystems } of systems) {
    // Grant access to addresses
    accessListAddresses.map(async (address) => calls.push(getGrantSystemAccessCallData(name, namespace, address)));

    // Grant access to other systems
    accessListSystems.map(async (granteeSystem) =>
      calls.push(getGrantSystemAccessCallData(name, namespace, await systemContracts[granteeSystem]))
    );
  }
  return calls;
}

function getGrantSystemAccessCallData(name: string, namespace: string, address: string): CallData {
  return {
    func: "grantAccess",
    args: [resourceToHex({ type: "system", namespace, name }), address],
  };
}
