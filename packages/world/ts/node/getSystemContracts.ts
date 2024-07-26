import path from "node:path";
import { World } from "../config/v2/output";
import { findSolidityFiles } from "./findSolidityFiles";

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
  const multipleNamespaces = false;
  const solidityFiles = await findSolidityFiles({
    cwd: rootDir,
    pattern: multipleNamespaces
      ? path.join(config.sourceDirectory, "namespaces/*/**")
      : path.join(config.sourceDirectory, "**"),
  });

  return solidityFiles
    .filter(
      (file) =>
        file.basename.endsWith("System") &&
        // exclude the base System contract
        file.basename !== "System" &&
        // exclude interfaces
        !/^I[A-Z]/.test(file.basename),
    )
    .map((file) => {
      const namespaceLabel = (() => {
        if (!multipleNamespaces) return config.namespace;
        const relativePath = path.relative(path.join(rootDir, config.sourceDirectory), file.filename);
        const label = (relativePath.match(/^namespaces\/(.*?)\//) ?? []).at(1);
        if (!label) {
          throw new Error(`Expected namespace directory for system file at ${file.filename}`);
        }
        return label;
      })();

      return {
        sourcePath: file.filename,
        namespaceLabel,
        systemLabel: file.basename,
      };
    });
}
