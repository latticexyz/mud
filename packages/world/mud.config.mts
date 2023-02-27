import { StoreUserConfig } from "@latticexyz/cli";
import { SchemaType } from "@latticexyz/schema-type";

const config: StoreUserConfig = {
  baseRoute: "/world_internals",

  tables: {
    RouteAccess: {
      storeArgument: true,
      primaryKeys: {
        routeId: SchemaType.UINT256,
        caller: SchemaType.ADDRESS,
      },
      schema: {
        value: SchemaType.BOOL
      },
    },
  }
};

export default config;
