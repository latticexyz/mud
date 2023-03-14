import { StoreUserConfig } from "@latticexyz/cli";
import { SchemaType } from "@latticexyz/schema-type";

const config: StoreUserConfig = {
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
        resourceSelector: SchemaType.BYTES32,
        caller: SchemaType.ADDRESS,
      },
      schema: {
        access: SchemaType.BOOL,
      },
      storeArgument: true,
    },
    Systems: {
      primaryKeys: {
        resourceSelector: SchemaType.BYTES32,
      },
      schema: {
        system: SchemaType.ADDRESS,
        publicAccess: SchemaType.BOOL,
      },
      storeArgument: true,
      dataStruct: false,
    },
    SystemRegistry: {
      directory: "/modules/registration/tables",
      primaryKeys: {
        system: SchemaType.ADDRESS,
      },
      schema: {
        resourceSelector: SchemaType.BYTES32,
      },
    },
    ResourceType: {
      directory: "/modules/registration/tables",
      primaryKeys: {
        resourceSelector: SchemaType.BYTES32,
      },
      schema: {
        resourceType: "Resource",
      },
    },
    FunctionSelectors: {
      fileSelector: "funcSelectors",
      primaryKeys: {
        functionSelector: SchemaType.BYTES4,
      },
      schema: {
        namespace: SchemaType.BYTES16,
        file: SchemaType.BYTES16,
        systemFunctionSelector: SchemaType.BYTES4,
      },
      dataStruct: false,
    },
    // Bool: {
    // TODO: This table is only used for testing, move it to `test/tables` via the directory config once supported
    //   primaryKeys: {},
    //   schema: {
    //     value: SchemaType.BOOL,
    //   },
    //   storeArgument: true, // TODO Add support for store argument in setter function to table autogen
    //   tableIdArgument: true,
    // },
    AddressArray: {
      // TODO: This table is only used for testing, move it to `test/tables` via the directory config once supported
      schema: { value: SchemaType.ADDRESS_ARRAY },
      storeArgument: true,
      tableIdArgument: true,
    },
    InstalledModules: {
      primaryKeys: {
        namespace: SchemaType.BYTES16,
        mdouleName: SchemaType.BYTES16,
      },
      schema: {
        moduleAddress: SchemaType.ADDRESS,
      },
      // TODO: this is a workaround to use `getRecord` instead of `getField` in the autogen library,
      // to allow using the table before it is registered. This is because `getRecord` passes the schema
      // to store, while `getField` loads it from storage. Remove this once we have support for passing the
      // schema in `getField` too.
      dataStruct: true,
    },
  },
  userTypes: {
    enums: {
      Resource: ["NONE", "NAMESPACE", "TABLE", "SYSTEM"],
    },
  },
};

export default config;
