import { StoreUserConfig } from "@latticexyz/cli";
import { SchemaType } from "@latticexyz/schema-type";

const config: StoreUserConfig = {
  storeImportPath: "../",
  baseRoute: "/store_internals",

  tables: {
    Hooks: SchemaType.ADDRESS_ARRAY,
    Callbacks: SchemaType.BYTES24_ARRAY,
    StoreMetadata: {
      primaryKeys: {
        tableId: SchemaType.UINT256,
      },
      schema: {
        tableName: SchemaType.STRING,
        abiEncodedFieldNames: SchemaType.BYTES,
      },
      storeArgument: true,
    },
    Mixed: {
      schema: {
        u32: SchemaType.UINT32,
        u128: SchemaType.UINT128,
        a32: SchemaType.UINT32_ARRAY,
        s: SchemaType.STRING,
      },
    },
    Vector2: {
      schema: {
        x: SchemaType.UINT32,
        y: SchemaType.UINT32,
      },
    },
  },
};

export default config;
