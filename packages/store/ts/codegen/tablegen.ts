import fs from "node:fs/promises";
import path from "node:path/posix";
import { formatAndWriteSolidity, renderEnums } from "@latticexyz/common/codegen";
import { renderTable } from "./renderTable";
import { renderTableIndex } from "./renderTableIndex";
import { Store as StoreConfig } from "../config/v2/output";
import { uniqueBy } from "@latticexyz/common/utils";
import { getUserTypes } from "./getUserTypes";
import { getUserTypesFilename } from "./getUserTypesFilename";
import { getTableOptions } from "./getTableOptions";

export type TablegenOptions = {
  /**
   * MUD project root directory where all other relative paths are resolved from.
   */
  rootDir: string;
  config: StoreConfig;
};

export async function tablegen({ rootDir, config }: TablegenOptions) {
  if (!path.isAbsolute(rootDir)) {
    throw new Error(`Expected \`rootDir\` to be an absolute path but got "${rootDir}"`);
  }

  console.log("tablegen rootDir", rootDir);
  const userTypes = getUserTypes({ config });

  // Write enums to user types file
  if (Object.keys(config.enums).length > 0) {
    const userTypesFilename = path.join(rootDir, getUserTypesFilename({ config }));
    const source = renderEnums(config.enums);
    await formatAndWriteSolidity(source, userTypesFilename, "Generated types file with enums");
  }

  await Promise.all(
    Object.values(config.namespaces).map(async (namespace) => {
      const sourceDir = config.multipleNamespaces
        ? path.join(config.sourceDirectory, "namespaces", namespace.label)
        : config.sourceDirectory;
      const codegenDir = path.join(sourceDir, config.codegen.outputDirectory);

      const tables = Object.values(namespace.tables);
      if (tables.length === 0) return;

      const tableOptions = getTableOptions({
        tables,
        rootDir,
        codegenDir,
        userTypes,
        storeImportPath: config.codegen.storeImportPath,
      });

      const tableDirs = uniqueBy(
        tableOptions.map(({ outputPath }) => path.dirname(outputPath)),
        (dir) => dir,
      );
      await Promise.all(tableDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));

      await Promise.all(
        tableOptions.map(async ({ outputPath, renderOptions }) => {
          const source = renderTable(renderOptions);
          return await formatAndWriteSolidity(source, outputPath, "Generated table");
        }),
      );

      if (config.codegen.indexFilename !== false && tableOptions.length > 0) {
        const codegenIndexPath = path.join(rootDir, codegenDir, config.codegen.indexFilename);
        const source = renderTableIndex(codegenIndexPath, tableOptions);
        await formatAndWriteSolidity(source, codegenIndexPath, "Generated table index");
      }
    }),
  );
}
