import path from "node:path";
import { Module } from "./common";
import { encodeField } from "@latticexyz/protocol-parser/internal";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";
import { bytesToHex } from "viem";
import { createPrepareDeploy } from "./createPrepareDeploy";
import { World } from "@latticexyz/world";
import { importContractArtifact } from "../utils/importContractArtifact";
import { resolveWithContext } from "@latticexyz/world/internal";
import callWithSignatureModule from "@latticexyz/world-module-callwithsignature/out/CallWithSignatureModule.sol/CallWithSignatureModule.json" with { type: "json" };
import { getContractArtifact } from "../utils/getContractArtifact";
import { excludeCallWithSignatureModule } from "./compat/excludeUnstableCallWithSignatureModule";
import { moduleArtifactPathFromName } from "./compat/moduleArtifactPathFromName";

const callWithSignatureModuleArtifact = getContractArtifact(callWithSignatureModule);

export async function configToModules<config extends World>(
  config: config,
  // TODO: remove/replace `forgeOutDir`
  forgeOutDir: string,
): Promise<readonly Module[]> {
  // metadata module is installed inside `ensureResourceTags`
  const defaultModules: Module[] = [
    {
      // optional for now
      // TODO: figure out approach to install on existing worlds where deployer may not own root namespace
      optional: true,
      name: "CallWithSignatureModule",
      installStrategy: "root",
      installData: "0x",
      prepareDeploy: createPrepareDeploy(
        callWithSignatureModuleArtifact.bytecode,
        callWithSignatureModuleArtifact.placeholders,
      ),
      deployedBytecodeSize: callWithSignatureModuleArtifact.deployedBytecodeSize,
      abi: callWithSignatureModuleArtifact.abi,
    },
  ];

  const modules = await Promise.all(
    config.modules
      .filter(excludeCallWithSignatureModule)
      .map(moduleArtifactPathFromName(forgeOutDir))
      .map(async (mod): Promise<Module> => {
        const name = path.basename(mod.artifactPath, ".json");
        const artifact = await importContractArtifact({ artifactPath: mod.artifactPath });

        // TODO: replace args with something more strongly typed
        const installArgs = mod.args
          .map((arg) => resolveWithContext(arg, { config }))
          .map((arg) => {
            const value = arg.value instanceof Uint8Array ? bytesToHex(arg.value) : arg.value;
            return encodeField(arg.type as SchemaAbiType, value as SchemaAbiTypeToPrimitiveType<SchemaAbiType>);
          });

        if (installArgs.length > 1) {
          throw new Error(`${name} module should only have 0-1 args, but had ${installArgs.length} args.`);
        }

        return {
          name,
          installStrategy: mod.root ? "root" : mod.useDelegation ? "delegation" : "default",
          installData: installArgs.length === 0 ? "0x" : installArgs[0],
          prepareDeploy: createPrepareDeploy(artifact.bytecode, artifact.placeholders),
          deployedBytecodeSize: artifact.deployedBytecodeSize,
          abi: artifact.abi,
        };
      }),
  );

  return [...defaultModules, ...modules];
}
