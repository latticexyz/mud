import { StoreConfig } from "../config/parseStoreConfig.js";
import { ImportDatum, RenderPrototypeOptions, RenderTableForPrototype } from "./types.js";
import { TableOptions } from "./tableOptions.js";
import path from "path";

export interface PrototypeOptions {
  outputPath: string;
  prototypeName: string;
  renderOptions: RenderPrototypeOptions;
}

export function getPrototypeOptions(config: StoreConfig, allTablesOptions: TableOptions[]): PrototypeOptions[] {
  const options = [];
  for (const prototypeName of Object.keys(config.prototypes)) {
    const prototypeData = config.prototypes[prototypeName];

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

      imports.push({
        symbol: tableLibraryName,
        fromPath: tableOptions.outputPath,
        usedInPath: prototypeData.directory,
      });
      if (structName !== undefined) {
        imports.push({
          symbol: structName,
          fromPath: tableOptions.outputPath,
          usedInPath: prototypeData.directory,
        });
      }
      for (const importDatum of tableImports) {
        imports.push({
          ...importDatum,
          usedInPath: prototypeData.directory,
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
      outputPath: path.join(prototypeData.directory, `${prototypeName}.sol`),
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
