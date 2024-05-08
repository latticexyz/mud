import path from "node:path";
import { Module } from "./common";
import { resolveWithContext } from "@latticexyz/config/library";
import { encodeField } from "@latticexyz/protocol-parser/internal";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";
import { bytesToHex, hexToBytes } from "viem";
import { createPrepareDeploy } from "./createPrepareDeploy";
import { World } from "@latticexyz/world";
import { getContractArtifact } from "../utils/getContractArtifact";
import { knownModuleArtifacts } from "../utils/knownModuleArtifacts";

export async function configToModules<config extends World>(
  config: config,
  forgeOutDir: string,
): Promise<readonly Module[]> {
  // TODO: this now expects namespaced tables when used with `resolveTableId`, ideally we replace args with something more strongly typed
  const resolveContext = {
    tableIds: Object.fromEntries(
      Object.entries(config.tables).map(([tableName, table]) => [tableName, hexToBytes(table.tableId)]),
    ),
  };

  const modules = await Promise.all(
    config.modules.map(async (mod): Promise<Module> => {
      const artifact = mod.artifactPath
        ? await getContractArtifact({ artifactPath: mod.artifactPath })
        : await getContractArtifact({
            artifactPath:
              knownModuleArtifacts[mod.name as keyof typeof knownModuleArtifacts] ??
              path.join(forgeOutDir, `${mod.name}.sol`, `${mod.name}.json`),
          });

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
        prepareDeploy: createPrepareDeploy(artifact.bytecode, artifact.placeholders),
        deployedBytecodeSize: artifact.deployedBytecodeSize,
        abi: artifact.abi,
      };
    }),
  );

  return modules;
}
