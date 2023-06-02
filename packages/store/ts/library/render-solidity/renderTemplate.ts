import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { StoreConfig, Templates } from "../config";

const formatValue = (mudConfig: StoreConfig, val: string, value: any) => {
  if (val in mudConfig.enums) {
    return `${val}(uint8(${value}))`;
  } else if (val.includes("bytes")) {
    return `"${value}"`;
  }
  return `${value}`;
};

const getValue = (mudConfig: StoreConfig, key: string, value: any) => {
  const schema = mudConfig.tables[key].schema;

  return Object.entries(value)
    .map(([fieldName, fieldValue]) => formatValue(mudConfig, schema[fieldName], fieldValue))
    .join(",");
};

export function renderTemplate(mudConfig: StoreConfig & { templates: Templates<StoreConfig> }, name: string) {
  const values = mudConfig.templates[name];

  return `
  ${renderedSolidityHeader}
  
  import { IStore } from "@latticexyz/store/src/IStore.sol";
  import { FactoryContent } from "@latticexyz/world/src/modules/factory/tables/FactoryContent.sol";
  import { FactoryIndex } from "@latticexyz/world/src/modules/factory/tables/FactoryIndex.sol";
  ${
    Object.keys(mudConfig.enums).length > 0
      ? `import { ${Object.keys(mudConfig.enums)
          .map((e) => e)
          .join(",")} } from "../Types.sol";`
      : ""
  }

  ${Object.keys(values)
    .map((key) => `import {${key}, ${key}TableId} from "../tables/${key}.sol"`)
    .join(";")};
  
  bytes32 constant templateId = "${name}";
  bytes32 constant ${name}TemplateId = templateId;
  uint256 constant LENGTH = ${Object.keys(values).length.toString()};

  function ${name}Template() {
    bytes32[] memory tableIds = new bytes32[](LENGTH);
    ${Object.keys(values)
      .map((key, i) => `tableIds[${i}] = ${key}TableId`)
      .join(";")};
    FactoryIndex.set(templateId, tableIds);

    ${Object.entries(values)
      .map(([key, value]) => {
        return `FactoryContent.set(templateId, ${key}TableId, ${key}.encode(${getValue(mudConfig, key, value)}))`;
      })
      .join(";")};
  }

  function ${name}Template(IStore store) {
    bytes32[] memory tableIds = new bytes32[](LENGTH);
    ${Object.keys(values)
      .map((key, i) => `tableIds[${i}] = ${key}TableId`)
      .join(";")};
    FactoryIndex.set(store, templateId, tableIds);

    ${Object.entries(values)
      .map(([key, value]) => {
        return `FactoryContent.set(store, templateId, ${key}TableId, ${key}.encode(${getValue(
          mudConfig,
          key,
          value
        )}))`;
      })
      .join(";")};
  }
  `;
}
