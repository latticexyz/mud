import { World } from "../config/v2/output";
import { findSolidityFiles } from "./findSolidityFiles";

export type SolidityContract = {
  readonly sourcePath: string;
  readonly name: string;
};

export type GetSystemContractsOptions = {
  readonly rootDir: string;
  readonly config: World;
};

export async function getSystemContracts({
  rootDir,
  config,
}: GetSystemContractsOptions): Promise<readonly SolidityContract[]> {
  const solidityFiles = await findSolidityFiles({ rootDir, config });

  return solidityFiles
    .map((file) => ({
      sourcePath: file.filename,
      name: file.basename,
    }))
    .filter(
      (file) =>
        file.name.endsWith("System") &&
        // exclude the base System contract
        file.name !== "System" &&
        // exclude interfaces
        !/^I[A-Z]/.test(file.name),
    );
}
