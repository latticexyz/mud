import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { StoreConfig } from "../config";

const getTemplateImports = (mudConfig: StoreConfig, values: object) => {
  const imports = Object.keys(values)
    .map((key) => {
      const schema = mudConfig.tables[key].schema;

      if (typeof schema === "object" && Object.keys(schema).length > 1) {
        return `import {${key}, ${key}TableId, ${key}Data} from "../tables/${key}.sol"`;
      } else {
        return `import {${key}, ${key}TableId} from "../tables/${key}.sol"`;
      }
    })
    .join(";");

  return imports;
};

const formatValue = (val: string, value: any, mudConfig: StoreConfig) => {
  if (val in mudConfig.enums) {
    return `${val}.${value}`;
  } else if (val.includes("bytes")) {
    return `"${value}"`;
  }
  return `${value}`;
};

const getValue = (mudConfig: StoreConfig, key: string, value: any) => {
  const schema = mudConfig.tables[key].schema;

  return Object.entries(value)
    .map(([fieldName, fieldValue]) => formatValue(schema[fieldName], fieldValue, mudConfig))
    .join(",");
};

export function renderTemplate(mudConfig: StoreConfig, templateConfig: Record<string, object>, name: string) {
  const values = templateConfig[name];

  return `
  ${renderedSolidityHeader}
  
  import { IStore } from "@latticexyz/store/src/IStore.sol";
  import { TemplateContent } from "@latticexyz/world/src/modules/templates/tables/TemplateContent.sol";
  import { TemplateIndex } from "@latticexyz/world/src/modules/templates/tables/TemplateIndex.sol";
  ${
    Object.keys(mudConfig.enums).length > 0
      ? `import { ${Object.keys(mudConfig.enums)
          .map((e) => e)
          .join(",")} } from "../Types.sol";`
      : ""
  }
  ${getTemplateImports(mudConfig, values)};
  
  bytes32 constant templateId = "${name}";
  bytes32 constant ${name}TemplateId = templateId;
  uint256 constant LENGTH = ${Object.keys(values).length.toString()};

  function ${name}Template() {
    bytes32[] memory tableIds = new bytes32[](LENGTH);
    ${Object.keys(values)
      .map((key, i) => `tableIds[${i}] = ${key}TableId`)
      .join(";")};
    TemplateIndex.set(templateId, tableIds);

    ${Object.entries(values)
      .map(([key, value]) => {
        return `TemplateContent.set(templateId, ${key}TableId, ${key}.encode(${getValue(mudConfig, key, value)}))`;
      })
      .join(";")};
  }

  function ${name}Template(IStore store) {
    bytes32[] memory tableIds = new bytes32[](LENGTH);
    ${Object.keys(values)
      .map((key, i) => `tableIds[${i}] = ${key}TableId`)
      .join(";")};
    TemplateIndex.set(store, templateId, tableIds);

    ${Object.entries(values)
      .map(([key, value]) => {
        return `TemplateContent.set(store, templateId, ${key}TableId, ${key}.encode(${getValue(
          mudConfig,
          key,
          value
        )}))`;
      })
      .join(";")};
  }
  `;
}
