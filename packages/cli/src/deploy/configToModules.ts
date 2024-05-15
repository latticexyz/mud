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
  // TODO: remove `forgeOutDir`
  forgeOutDir: string,
  configPath: string,
): Promise<readonly Module[]> {
  // this expects a namespaced table name when used with `resolveTableId`
  const resolveContext = {
    tableIds: Object.fromEntries(
      Object.entries(config.tables).map(([tableName, table]) => [tableName, hexToBytes(table.tableId)]),
    ),
  };

  const modules = await Promise.all(
    config.modules.map(async (mod): Promise<Module> => {
      let artifactPath = mod.artifactPath;

      // Backwards compatibility
      // TODO: move this up a level so we don't need `forgeOutDir` in here?
      if (!artifactPath) {
        if (mod.name) {
          artifactPath =
            knownModuleArtifacts[mod.name as keyof typeof knownModuleArtifacts] ??
            path.join(forgeOutDir, `${mod.name}.sol`, `${mod.name}.json`);
          console.warn(
            [
              "",
              `⚠️ Your \`mud.config.ts\` is using a module with a \`name\`, but this option is deprecated.`,
              "",
              "To resolve this, you can replace this:",
              "",
              `  name: ${JSON.stringify(mod.name)}`,
              "",
              "with this:",
              "",
              `  artifactPath: ${JSON.stringify(artifactPath)}`,
              "",
            ].join("\n"),
          );
        } else {
          throw new Error("No `artifactPath` provided for module.");
        }
      }

      const name = path.basename(artifactPath, ".json");
      const artifact = await getContractArtifact({ artifactPath, configPath });

      // TODO: replace args with something more strongly typed
      const installArgs = mod.args
        .map((arg) => resolveWithContext(arg, resolveContext))
        .map((arg) => {
          const value = arg.value instanceof Uint8Array ? bytesToHex(arg.value) : arg.value;
          return encodeField(arg.type as SchemaAbiType, value as SchemaAbiTypeToPrimitiveType<SchemaAbiType>);
        });

      if (installArgs.length > 1) {
        throw new Error(`${name} module should only have 0-1 args, but had ${installArgs.length} args.`);
      }

      return {
        name,
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
