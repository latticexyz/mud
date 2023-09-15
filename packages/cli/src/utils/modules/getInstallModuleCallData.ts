import { defaultAbiCoder } from "ethers/lib/utils.js";
import { resolveWithContext } from "@latticexyz/config";
import { Module } from "./types";
import { CallData } from "../utils/types";
import { TableIds } from "../tables/types";

export async function getInstallModuleCallData(
  moduleContracts: Record<string, Promise<string>>,
  module: Module,
  tableIds: TableIds
): Promise<CallData> {
  const moduleAddress = await moduleContracts[module.name];
  if (!moduleAddress) throw new Error(`Module ${module.name} not found`);
  // Resolve arguments
  const resolvedArgs = module.args.map((arg) =>
    resolveWithContext(arg, {
      tableIds,
    })
  );
  const values = resolvedArgs.map((arg) => arg.value);
  const types = resolvedArgs.map((arg) => arg.type);

  return {
    func: module.root ? "installRootModule" : "installModule",
    args: [moduleAddress, defaultAbiCoder.encode(types, values)],
  };
}
