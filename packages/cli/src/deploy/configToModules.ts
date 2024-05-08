import { ConfigInput, Module } from "./common";
import { resourceToHex } from "@latticexyz/common";
import { resolveWithContext } from "@latticexyz/config/library";
import { encodeField } from "@latticexyz/protocol-parser/internal";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";
import { hexToBytes, bytesToHex } from "viem";
import { defaultModuleContracts } from "../utils/defaultModuleContracts";
import { getContractData } from "../utils/getContractData";
import { createPrepareDeploy } from "./createPrepareDeploy";

export function configToModules<config extends ConfigInput>(config: config, forgeOutDir: string): readonly Module[] {
  // ugh (https://github.com/latticexyz/mud/issues/1668)
  const resolveContext = {
    tableIds: Object.fromEntries(
      Object.entries(config.tables).map(([tableName, table]) => [
        tableName,
        hexToBytes(
          resourceToHex({
            type: table.offchainOnly ? "offchainTable" : "table",
            namespace: config.namespace,
            name: table.name,
          }),
        ),
      ]),
    ),
  };

  const modules = config.modules.map((mod): Module => {
    const contractData =
      defaultModuleContracts.find((defaultMod) => defaultMod.name === mod.name) ??
      getContractData(`${mod.name}.sol`, mod.name, forgeOutDir);
    const installArgs = mod.args
      .map((arg) => resolveWithContext(arg, resolveContext))
      .map((arg) => {
        const value = arg.value instanceof Uint8Array ? bytesToHex(arg.value) : arg.value;
        return encodeField(arg.type as SchemaAbiType, value as SchemaAbiTypeToPrimitiveType<SchemaAbiType>);
      });
    if (installArgs.length > 1) {
      throw new Error(`${mod.name} module should only have 0-1 args, but had ${installArgs.length} args.`);
    }
    return {
      name: mod.name,
      installAsRoot: mod.root,
      installData: installArgs.length === 0 ? "0x" : installArgs[0],
      prepareDeploy: createPrepareDeploy(contractData.bytecode, contractData.placeholders),
      deployedBytecodeSize: contractData.deployedBytecodeSize,
      abi: contractData.abi,
    };
  });

  return modules;
}
