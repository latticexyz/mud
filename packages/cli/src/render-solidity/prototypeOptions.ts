import path from "path";
import { StoreConfig } from "../config/parseStoreConfig.js";
import { ImportDatum, RenderPrototypeOptions, RenderTableForPrototype } from "./types.js";
import { TableOptions } from "./tableOptions.js";

export interface PrototypeOptions {
  outputDirectory: string;
  prototypeName: string;
  renderOptions: RenderPrototypeOptions;
}

export function getAllPrototypeOptions(
  config: StoreConfig,
  allTablesOptions: TableOptions[],
  srcDirectory: string
): PrototypeOptions[] {
  const options = [];
  for (const prototypeName of Object.keys(config.prototypes)) {
    const prototypeData = config.prototypes[prototypeName];
    const outputDirectory = path.join(srcDirectory, prototypeData.directory);

    const tablesOptions = allTablesOptions.filter(({ tableName }) =>
      Object.keys(prototypeData.tables).includes(tableName)
    );
    const primaryKeys = tablesOptions[0].renderOptions.primaryKeys;

    // list of any symbols that need to be imported
    const imports: ImportDatum[] = [];

    const tableConfigs = Object.keys(prototypeData.tables).map((tableName): RenderTableForPrototype => {
      const { default: tableDefault } = prototypeData.tables[tableName];
      const tableOptions = tablesOptions.find((val) => val.tableName === tableName);
      if (tableOptions === undefined) throw new Error(`No render options found for table ${tableName}`);

      const {
        libraryName: tableLibraryName,
        structName,
        imports: tableImports,
        staticRouteData,
      } = tableOptions.renderOptions;

      const importTableRelativePath = "./" + path.relative(outputDirectory, tableOptions.outputPath);
      imports.push({
        symbol: tableLibraryName,
        path: importTableRelativePath,
        pathFromSrc: tableOptions.outputDirectory,
      });
      if (structName !== undefined) {
        imports.push({
          symbol: structName,
          path: importTableRelativePath,
          pathFromSrc: tableOptions.outputDirectory,
        });
      }
      for (const importDatum of tableImports) {
        imports.push({
          ...importDatum,
          path: "./" + path.relative(outputDirectory, importDatum.pathFromSrc) + ".sol",
        });
      }

      const fields = tableOptions.renderOptions.fields.map((field) => {
        return {
          ...field,
          default: typeof tableDefault === "object" ? tableDefault[field.name] : undefined,
        };
      });

      if (staticRouteData === undefined) throw new Error("Prototypes with table id arguments are not supported");

      return {
        libraryName: tableLibraryName,
        structName,
        staticRouteData,
        fields,
        default: typeof structName !== "undefined" && typeof tableDefault === "string" ? tableDefault : undefined,
      };
    });

    options.push({
      outputDirectory,
      prototypeName,
      renderOptions: {
        imports,
        libraryName: prototypeName,
        primaryKeys,
        tables: tableConfigs,
      },
    });
  }
  return options;
}
