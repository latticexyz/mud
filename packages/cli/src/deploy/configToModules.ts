import path from "node:path";
import { Library, Module } from "./common";
import { encodeField } from "@latticexyz/protocol-parser/internal";
import { SchemaAbiType, SchemaAbiTypeToPrimitiveType } from "@latticexyz/schema-type/internal";
import { bytesToHex } from "viem";
import { createPrepareDeploy } from "./createPrepareDeploy";
import { World } from "@latticexyz/world";
import { importContractArtifact } from "../utils/importContractArtifact";
import { resolveWithContext } from "@latticexyz/world/internal";
import { findLibraries } from "./findLibraries";
import { getContractData } from "../utils/getContractData";
import { createRequire } from "node:module";
import { findUp } from "find-up";

/** Please don't add to this list! These are kept for backwards compatibility and assumes the downstream project has this module installed as a dependency. */
const knownModuleArtifacts = {
  KeysWithValueModule: "@latticexyz/world-modules/out/KeysWithValueModule.sol/KeysWithValueModule.json",
  KeysInTableModule: "@latticexyz/world-modules/out/KeysInTableModule.sol/KeysInTableModule.json",
  UniqueEntityModule: "@latticexyz/world-modules/out/UniqueEntityModule.sol/UniqueEntityModule.json",
  Unstable_CallWithSignatureModule:
    "@latticexyz/world-modules/out/Unstable_CallWithSignatureModule.sol/Unstable_CallWithSignatureModule.json",
};

export async function configToModules<config extends World>(
  config: config,
  // TODO: remove/replace `forgeOutDir`
  forgeOutDir: string,
): Promise<readonly Module[]> {
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
      const artifact = await importContractArtifact({ artifactPath });

      const requirePath = await findUp("package.json", { cwd: process.cwd() });
      if (!requirePath) throw new Error("Could not find package.json to import relative to.");
      const require = createRequire(requirePath);

      const moduleOutDir = path.join(require.resolve(artifactPath), "../../");
      const libraries = findLibraries(moduleOutDir).map((library): Library => {
        // foundry/solc flattens artifacts, so we just use the path basename
        const contractData = getContractData(path.basename(library.path), library.name, moduleOutDir);
        return {
          path: library.path,
          name: library.name,
          abi: contractData.abi,
          prepareDeploy: createPrepareDeploy(contractData.bytecode, contractData.placeholders),
          deployedBytecodeSize: contractData.deployedBytecodeSize,
        };
      });

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
        libraries,
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
