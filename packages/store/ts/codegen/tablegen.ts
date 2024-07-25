import fs from "node:fs/promises";
import path from "node:path";
import { formatAndWriteSolidity, loadAndExtractUserTypes, renderEnums } from "@latticexyz/common/codegen";
import { renderTable } from "./renderTable";
import { renderTableIndex } from "./renderTableIndex";
import { Store as StoreConfig } from "../config/v2/output";
import { mapObject, uniqueBy } from "@latticexyz/common/utils";
import { getUserTypes } from "./getUserTypes";
import { getUserTypesFilename } from "./getUserTypesFilename";
import { getTableOptions } from "./getTableOptions";

export type TablegenOptions = {
  /**
   * MUD project root directory where all other relative paths are resolved from.
   */
  rootDir: string;
  config: StoreConfig;
  remappings: [string, string][];
};

export async function tablegen({ rootDir, config, remappings }: TablegenOptions) {
  const userTypes = getUserTypes({ config });

  const solidityUserTypes = loadAndExtractUserTypes(
    mapObject(config.userTypes, (type) => ({ ...type, internalType: type.type })),
    path.join(rootDir, config.sourceDirectory, config.codegen.outputDirectory),
    remappings,
  );

  // Write enums to user types file
  if (Object.keys(config.enums).length > 0) {
    await formatAndWriteSolidity(
      renderEnums(config.enums),
      path.join(rootDir, getUserTypesFilename({ config })),
      "Generated types file with enums",
    );
  }

  await Promise.all(
    Object.values(config.namespaces).map(async (namespace) => {
      // TODO: get this value from config once multiple namespaces are supported
      const multipleNamespaces = false;
      const sourceDir = multipleNamespaces
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
        // TODO: remove
        config,
        solidityUserTypes,
      });

      const tableDirs = uniqueBy(
        tableOptions.map(({ outputPath }) => path.dirname(outputPath)),
        (dir) => dir,
      );
      await Promise.all(tableDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));

      await Promise.all(
        tableOptions.map(({ outputPath, renderOptions }) =>
          formatAndWriteSolidity(renderTable(renderOptions), outputPath, "Generated table"),
        ),
      );

      const codegenIndexPath = path.join(rootDir, codegenDir, config.codegen.indexFilename);
      await formatAndWriteSolidity(
        renderTableIndex(codegenIndexPath, tableOptions),
        codegenIndexPath,
        "Generated table index",
      );
    }),
  );
}
