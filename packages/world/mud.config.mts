import { StoreUserConfig } from "@latticexyz/cli";
import { SchemaType } from "@latticexyz/schema-type";

const config: StoreUserConfig = {
  baseRoute: "/world_internals",

  tables: {
    NamespaceOwner: {
      primaryKeys: {
        namespace: SchemaType.BYTES16,
      },
      schema: {
        owner: SchemaType.ADDRESS,
      },
      storeArgument: true,
    },
    ResourceAccess: {
      primaryKeys: {
        selector: SchemaType.BYTES32,
        caller: SchemaType.ADDRESS,
      },
      schema: {
        access: SchemaType.BOOL,
      },
      storeArgument: true,
    },
    RouteAccess: {
      primaryKeys: {
        routeId: SchemaType.UINT256,
        caller: SchemaType.ADDRESS,
      },
      schema: {
        value: SchemaType.BOOL,
      },
      storeArgument: true,
    },
    SystemTable: {
      primaryKeys: {
        routeId: SchemaType.UINT256,
      },
      schema: {
        system: SchemaType.ADDRESS,
        publicAccess: SchemaType.BOOL,
      },
      storeArgument: true,
      dataStruct: false,
    },
  },
};

export default config;
