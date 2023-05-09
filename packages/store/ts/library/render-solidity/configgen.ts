import { resolveAbiOrUserType } from ".";
import { SchemaType } from "@latticexyz/schema-type";
import { formatAndWriteTypescript } from "@latticexyz/common/codegen";
import { StoreConfig } from "../config";
import path from "path";

const schemaTypesToTypeStrings: Record<SchemaType, string> = {
  [SchemaType.UINT8]: "number",
  [SchemaType.UINT16]: "number",
  [SchemaType.UINT24]: "number",
  [SchemaType.UINT32]: "number",
  [SchemaType.UINT40]: "number",
  [SchemaType.UINT48]: "number",
  [SchemaType.UINT56]: "bigint",
  [SchemaType.UINT64]: "bigint",
  [SchemaType.UINT72]: "bigint",
  [SchemaType.UINT80]: "bigint",
  [SchemaType.UINT88]: "bigint",
  [SchemaType.UINT96]: "bigint",
  [SchemaType.UINT104]: "bigint",
  [SchemaType.UINT112]: "bigint",
  [SchemaType.UINT120]: "bigint",
  [SchemaType.UINT128]: "bigint",
  [SchemaType.UINT136]: "bigint",
  [SchemaType.UINT144]: "bigint",
  [SchemaType.UINT152]: "bigint",
  [SchemaType.UINT160]: "bigint",
  [SchemaType.UINT168]: "bigint",
  [SchemaType.UINT176]: "bigint",
  [SchemaType.UINT184]: "bigint",
  [SchemaType.UINT192]: "bigint",
  [SchemaType.UINT200]: "bigint",
  [SchemaType.UINT208]: "bigint",
  [SchemaType.UINT216]: "bigint",
  [SchemaType.UINT224]: "bigint",
  [SchemaType.UINT232]: "bigint",
  [SchemaType.UINT240]: "bigint",
  [SchemaType.UINT248]: "bigint",
  [SchemaType.UINT256]: "bigint",
  [SchemaType.INT8]: "number",
  [SchemaType.INT16]: "number",
  [SchemaType.INT24]: "number",
  [SchemaType.INT32]: "number",
  [SchemaType.INT40]: "number",
  [SchemaType.INT48]: "number",
  [SchemaType.INT56]: "bigint",
  [SchemaType.INT64]: "bigint",
  [SchemaType.INT72]: "bigint",
  [SchemaType.INT80]: "bigint",
  [SchemaType.INT88]: "bigint",
  [SchemaType.INT96]: "bigint",
  [SchemaType.INT104]: "bigint",
  [SchemaType.INT112]: "bigint",
  [SchemaType.INT120]: "bigint",
  [SchemaType.INT128]: "bigint",
  [SchemaType.INT136]: "bigint",
  [SchemaType.INT144]: "bigint",
  [SchemaType.INT152]: "bigint",
  [SchemaType.INT160]: "bigint",
  [SchemaType.INT168]: "bigint",
  [SchemaType.INT176]: "bigint",
  [SchemaType.INT184]: "bigint",
  [SchemaType.INT192]: "bigint",
  [SchemaType.INT200]: "bigint",
  [SchemaType.INT208]: "bigint",
  [SchemaType.INT216]: "bigint",
  [SchemaType.INT224]: "bigint",
  [SchemaType.INT232]: "bigint",
  [SchemaType.INT240]: "bigint",
  [SchemaType.INT248]: "bigint",
  [SchemaType.INT256]: "bigint",
  [SchemaType.BYTES1]: "string",
  [SchemaType.BYTES2]: "string",
  [SchemaType.BYTES3]: "string",
  [SchemaType.BYTES4]: "string",
  [SchemaType.BYTES5]: "string",
  [SchemaType.BYTES6]: "string",
  [SchemaType.BYTES7]: "string",
  [SchemaType.BYTES8]: "string",
  [SchemaType.BYTES9]: "string",
  [SchemaType.BYTES10]: "string",
  [SchemaType.BYTES11]: "string",
  [SchemaType.BYTES12]: "string",
  [SchemaType.BYTES13]: "string",
  [SchemaType.BYTES14]: "string",
  [SchemaType.BYTES15]: "string",
  [SchemaType.BYTES16]: "string",
  [SchemaType.BYTES17]: "string",
  [SchemaType.BYTES18]: "string",
  [SchemaType.BYTES19]: "string",
  [SchemaType.BYTES20]: "string",
  [SchemaType.BYTES21]: "string",
  [SchemaType.BYTES22]: "string",
  [SchemaType.BYTES23]: "string",
  [SchemaType.BYTES24]: "string",
  [SchemaType.BYTES25]: "string",
  [SchemaType.BYTES26]: "string",
  [SchemaType.BYTES27]: "string",
  [SchemaType.BYTES28]: "string",
  [SchemaType.BYTES29]: "string",
  [SchemaType.BYTES30]: "string",
  [SchemaType.BYTES31]: "string",
  [SchemaType.BYTES32]: "string",
  [SchemaType.BOOL]: "boolean",
  [SchemaType.ADDRESS]: "string",
  [SchemaType.UINT8_ARRAY]: "number[]",
  [SchemaType.UINT16_ARRAY]: "number[]",
  [SchemaType.UINT24_ARRAY]: "number[]",
  [SchemaType.UINT32_ARRAY]: "number[]",
  [SchemaType.UINT40_ARRAY]: "number[]",
  [SchemaType.UINT48_ARRAY]: "number[]",
  [SchemaType.UINT56_ARRAY]: "bigint[]",
  [SchemaType.UINT64_ARRAY]: "bigint[]",
  [SchemaType.UINT72_ARRAY]: "bigint[]",
  [SchemaType.UINT80_ARRAY]: "bigint[]",
  [SchemaType.UINT88_ARRAY]: "bigint[]",
  [SchemaType.UINT96_ARRAY]: "bigint[]",
  [SchemaType.UINT104_ARRAY]: "bigint[]",
  [SchemaType.UINT112_ARRAY]: "bigint[]",
  [SchemaType.UINT120_ARRAY]: "bigint[]",
  [SchemaType.UINT128_ARRAY]: "bigint[]",
  [SchemaType.UINT136_ARRAY]: "bigint[]",
  [SchemaType.UINT144_ARRAY]: "bigint[]",
  [SchemaType.UINT152_ARRAY]: "bigint[]",
  [SchemaType.UINT160_ARRAY]: "bigint[]",
  [SchemaType.UINT168_ARRAY]: "bigint[]",
  [SchemaType.UINT176_ARRAY]: "bigint[]",
  [SchemaType.UINT184_ARRAY]: "bigint[]",
  [SchemaType.UINT192_ARRAY]: "bigint[]",
  [SchemaType.UINT200_ARRAY]: "bigint[]",
  [SchemaType.UINT208_ARRAY]: "bigint[]",
  [SchemaType.UINT216_ARRAY]: "bigint[]",
  [SchemaType.UINT224_ARRAY]: "bigint[]",
  [SchemaType.UINT232_ARRAY]: "bigint[]",
  [SchemaType.UINT240_ARRAY]: "bigint[]",
  [SchemaType.UINT248_ARRAY]: "bigint[]",
  [SchemaType.UINT256_ARRAY]: "bigint[]",
  [SchemaType.INT8_ARRAY]: "number[]",
  [SchemaType.INT16_ARRAY]: "number[]",
  [SchemaType.INT24_ARRAY]: "number[]",
  [SchemaType.INT32_ARRAY]: "number[]",
  [SchemaType.INT40_ARRAY]: "number[]",
  [SchemaType.INT48_ARRAY]: "number[]",
  [SchemaType.INT56_ARRAY]: "bigint[]",
  [SchemaType.INT64_ARRAY]: "bigint[]",
  [SchemaType.INT72_ARRAY]: "bigint[]",
  [SchemaType.INT80_ARRAY]: "bigint[]",
  [SchemaType.INT88_ARRAY]: "bigint[]",
  [SchemaType.INT96_ARRAY]: "bigint[]",
  [SchemaType.INT104_ARRAY]: "bigint[]",
  [SchemaType.INT112_ARRAY]: "bigint[]",
  [SchemaType.INT120_ARRAY]: "bigint[]",
  [SchemaType.INT128_ARRAY]: "bigint[]",
  [SchemaType.INT136_ARRAY]: "bigint[]",
  [SchemaType.INT144_ARRAY]: "bigint[]",
  [SchemaType.INT152_ARRAY]: "bigint[]",
  [SchemaType.INT160_ARRAY]: "bigint[]",
  [SchemaType.INT168_ARRAY]: "bigint[]",
  [SchemaType.INT176_ARRAY]: "bigint[]",
  [SchemaType.INT184_ARRAY]: "bigint[]",
  [SchemaType.INT192_ARRAY]: "bigint[]",
  [SchemaType.INT200_ARRAY]: "bigint[]",
  [SchemaType.INT208_ARRAY]: "bigint[]",
  [SchemaType.INT216_ARRAY]: "bigint[]",
  [SchemaType.INT224_ARRAY]: "bigint[]",
  [SchemaType.INT232_ARRAY]: "bigint[]",
  [SchemaType.INT240_ARRAY]: "bigint[]",
  [SchemaType.INT248_ARRAY]: "bigint[]",
  [SchemaType.INT256_ARRAY]: "bigint[]",
  [SchemaType.BYTES1_ARRAY]: "bigint[]",
  [SchemaType.BYTES2_ARRAY]: "bigint[]",
  [SchemaType.BYTES3_ARRAY]: "bigint[]",
  [SchemaType.BYTES4_ARRAY]: "bigint[]",
  [SchemaType.BYTES5_ARRAY]: "bigint[]",
  [SchemaType.BYTES6_ARRAY]: "bigint[]",
  [SchemaType.BYTES7_ARRAY]: "bigint[]",
  [SchemaType.BYTES8_ARRAY]: "bigint[]",
  [SchemaType.BYTES9_ARRAY]: "bigint[]",
  [SchemaType.BYTES10_ARRAY]: "bigint[]",
  [SchemaType.BYTES11_ARRAY]: "bigint[]",
  [SchemaType.BYTES12_ARRAY]: "bigint[]",
  [SchemaType.BYTES13_ARRAY]: "bigint[]",
  [SchemaType.BYTES14_ARRAY]: "bigint[]",
  [SchemaType.BYTES15_ARRAY]: "bigint[]",
  [SchemaType.BYTES16_ARRAY]: "bigint[]",
  [SchemaType.BYTES17_ARRAY]: "bigint[]",
  [SchemaType.BYTES18_ARRAY]: "bigint[]",
  [SchemaType.BYTES19_ARRAY]: "bigint[]",
  [SchemaType.BYTES20_ARRAY]: "bigint[]",
  [SchemaType.BYTES21_ARRAY]: "bigint[]",
  [SchemaType.BYTES22_ARRAY]: "bigint[]",
  [SchemaType.BYTES23_ARRAY]: "bigint[]",
  [SchemaType.BYTES24_ARRAY]: "bigint[]",
  [SchemaType.BYTES25_ARRAY]: "bigint[]",
  [SchemaType.BYTES26_ARRAY]: "bigint[]",
  [SchemaType.BYTES27_ARRAY]: "bigint[]",
  [SchemaType.BYTES28_ARRAY]: "bigint[]",
  [SchemaType.BYTES29_ARRAY]: "bigint[]",
  [SchemaType.BYTES30_ARRAY]: "bigint[]",
  [SchemaType.BYTES31_ARRAY]: "bigint[]",
  [SchemaType.BYTES32_ARRAY]: "bigint[]",
  [SchemaType.BOOL_ARRAY]: "boolean[]",
  [SchemaType.ADDRESS_ARRAY]: "string[]",
  [SchemaType.BYTES]: "string",
  [SchemaType.STRING]: "string",
};

const getTypeString = (abiOrUserType: string, config: StoreConfig) => {
  if (abiOrUserType in config.enums) {
    return config.enums[abiOrUserType].map((element) => `"${element}"`).join("|");
  }

  const { schemaType } = resolveAbiOrUserType(abiOrUserType, config);

  return schemaTypesToTypeStrings[schemaType];
};

export async function configgen(config: StoreConfig, outputBaseDirectory: string) {
  const fullOutputPath = path.join(outputBaseDirectory, `template.ts`);

  const tables = Object.entries(config.tables)
    .map(([key, value]) => {
      if (typeof value.schema === "object") {
        const fields = Object.entries(value.schema)
          .map(([name, entry]) => `${name}: ${getTypeString(entry, config)}`)
          .join(";");
        return `${key}? : {${fields}}`;
      } else {
        return `${key}?: ${getTypeString(value.schema, config)}`;
      }
    })
    .join(";");

  const output = `
  /* Autogenerated file. Do not edit manually. */

  interface ConfigType {
    ${tables}
  }
  
  export interface TemplateConfig {
    templates: Record<string, ConfigType>;
  }

  export function templateConfig(config: TemplateConfig) {
    return config;
  }`;

  await formatAndWriteTypescript(output, fullOutputPath, "Generated config types");
}
