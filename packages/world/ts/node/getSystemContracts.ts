import path from "node:path";
import fs from "node:fs/promises";
import { World } from "../config/v2/output";
import { findSolidityFiles } from "./findSolidityFiles";
import { parseSystem } from "@latticexyz/common/codegen";
import { isDefined } from "@latticexyz/common/utils";

export type SystemContract = {
  readonly sourcePath: string;
  readonly namespaceLabel: string;
  readonly systemLabel: string;
};

export type GetSystemContractsOptions = {
  readonly rootDir: string;
  readonly config: World;
};

export async function getSystemContracts({
  rootDir,
  config,
}: GetSystemContractsOptions): Promise<readonly SystemContract[]> {
  const filePaths = await findSolidityFiles({
    cwd: rootDir,
    pattern: path.join(config.sourceDirectory, "**"),
  });

  const files = await Promise.all(
    filePaths.map(async (file) => {
      const source = await fs.readFile(path.join(rootDir, file.filename), "utf-8");
      return { ...file, source };
    }),
  );

  return files
    .map((file) => {
      const parsedSystem = parseSystem(file.source, file.basename);
      if (!parsedSystem) return;

      const namespaceLabel = (() => {
        // TODO: remove `config.namespace` null check once this narrows properly
        if (!config.multipleNamespaces && config.namespace != null) return config.namespace;

        const relativePath = path.relative(path.join(rootDir, config.sourceDirectory), file.filename);
        const [namespacesDir, namespaceDir] = relativePath.split(path.sep);
        if (namespacesDir === "namespaces" && namespaceDir) {
          return namespaceDir;
        }
        // TODO: is this too aggressive? will this be problematic for world-modules (systems independent of namespaces)?
        // TODO: filter based on excluded systems in config?
        throw new Error(
          `Expected system file at "${file.filename}" to be in a namespace directory like "${path.join(config.sourceDirectory, "namespaces/{namespace}", relativePath)}"`,
        );
      })();

      return {
        sourcePath: file.filename,
        namespaceLabel,
        systemLabel: file.basename,
      } satisfies SystemContract;
    })
    .filter(isDefined);
}
