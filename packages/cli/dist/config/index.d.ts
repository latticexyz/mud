import { AbiType, StaticAbiType } from '@latticexyz/schema-type';
import { z, RefinementCtx } from 'zod';

type RequireKeys<T extends Record<string, unknown>, P extends string> = T & Required<Pick<T, P>>;
type StringForUnion = string & Record<never, never>;
type StaticArray = `${StaticAbiType}[${number}]`;
type ExtractUserTypes<UnknownTypes extends StringForUnion> = Exclude<UnknownTypes, AbiType | StaticArray>;
type AsDependent<T> = T extends infer P ? P : never;

declare function loadStoreConfig(configPath?: string): Promise<{
    tables: Record<string, RequireKeys<RequireKeys<{
        directory: string;
        tableIdArgument: boolean;
        storeArgument: boolean;
        primaryKeys: Record<string, string>;
        schema: Record<string, string>;
        fileSelector?: string | undefined;
        dataStruct?: boolean | undefined;
    }, "dataStruct">, "fileSelector">>;
    enums: Record<string, string[]>;
    namespace: string;
    storeImportPath: string;
    userTypesPath: string;
}>;

type FieldData<UserTypes extends StringForUnion> = AbiType | StaticArray | UserTypes;
type PrimaryKey<StaticUserTypes extends StringForUnion> = StaticAbiType | StaticUserTypes;
/************************************************************************
 *
 *    TABLE SCHEMA
 *
 ************************************************************************/
type FullSchemaConfig<UserTypes extends StringForUnion = StringForUnion> = Record<string, FieldData<UserTypes>>;
type ShorthandSchemaConfig<UserTypes extends StringForUnion = StringForUnion> = FieldData<UserTypes>;
type SchemaConfig<UserTypes extends StringForUnion = StringForUnion> = FullSchemaConfig<UserTypes> | ShorthandSchemaConfig<UserTypes>;
declare const zSchemaConfig: z.ZodUnion<[z.ZodEffects<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodEffects<z.ZodString, Record<string, string>, string>]>;
/************************************************************************
 *
 *    TABLE
 *
 ************************************************************************/
interface TableConfig<UserTypes extends StringForUnion = StringForUnion, StaticUserTypes extends StringForUnion = StringForUnion> {
    /** Output directory path for the file. Default is "tables" */
    directory?: string;
    /**
     * The fileSelector is used with the namespace to register the table and construct its id.
     * The table id will be uint256(bytes32(abi.encodePacked(bytes16(namespace), bytes16(fileSelector)))).
     * Default is "<tableName>"
     * */
    fileSelector?: string;
    /** Make methods accept `tableId` argument instead of it being a hardcoded constant. Default is false */
    tableIdArgument?: boolean;
    /** Include methods that accept a manual `IStore` argument. Default is false. */
    storeArgument?: boolean;
    /** Include a data struct and methods for it. Default is false for 1-column tables; true for multi-column tables. */
    dataStruct?: boolean;
    /** Table's primary key names mapped to their types. Default is `{ key: "bytes32" }` */
    primaryKeys?: Record<string, PrimaryKey<StaticUserTypes>>;
    /** Table's column names mapped to their types. Table name's 1st letter should be lowercase. */
    schema: SchemaConfig<UserTypes>;
}
declare const zTableConfig: z.ZodUnion<[z.ZodEffects<z.ZodObject<{
    directory: z.ZodDefault<z.ZodString>;
    fileSelector: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    tableIdArgument: z.ZodDefault<z.ZodBoolean>;
    storeArgument: z.ZodDefault<z.ZodBoolean>;
    primaryKeys: z.ZodDefault<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodString>>;
    schema: z.ZodUnion<[z.ZodEffects<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodEffects<z.ZodString, Record<string, string>, string>]>;
    dataStruct: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    tableIdArgument: boolean;
    storeArgument: boolean;
    primaryKeys: Record<string, string>;
    schema: Record<string, string>;
    fileSelector?: string | undefined;
    dataStruct?: boolean | undefined;
}, {
    schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
    directory?: string | undefined;
    fileSelector?: string | undefined;
    tableIdArgument?: boolean | undefined;
    storeArgument?: boolean | undefined;
    primaryKeys?: Record<string, string> | undefined;
    dataStruct?: boolean | undefined;
}>, RequireKeys<{
    directory: string;
    tableIdArgument: boolean;
    storeArgument: boolean;
    primaryKeys: Record<string, string>;
    schema: Record<string, string>;
    fileSelector?: string | undefined;
    dataStruct?: boolean | undefined;
}, "dataStruct">, {
    schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
    directory?: string | undefined;
    fileSelector?: string | undefined;
    tableIdArgument?: boolean | undefined;
    storeArgument?: boolean | undefined;
    primaryKeys?: Record<string, string> | undefined;
    dataStruct?: boolean | undefined;
}>, z.ZodEffects<z.ZodString, RequireKeys<{
    directory: string;
    tableIdArgument: boolean;
    storeArgument: boolean;
    primaryKeys: Record<string, string>;
    schema: Record<string, string>;
    fileSelector?: string | undefined;
    dataStruct?: boolean | undefined;
}, "dataStruct">, string>]>;
/************************************************************************
 *
 *    TABLES
 *
 ************************************************************************/
type TablesConfig<UserTypes extends StringForUnion = StringForUnion, StaticUserTypes extends StringForUnion = StringForUnion> = Record<string, TableConfig<UserTypes, StaticUserTypes> | FieldData<UserTypes>>;
declare const zTablesConfig: z.ZodEffects<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodUnion<[z.ZodEffects<z.ZodObject<{
    directory: z.ZodDefault<z.ZodString>;
    fileSelector: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    tableIdArgument: z.ZodDefault<z.ZodBoolean>;
    storeArgument: z.ZodDefault<z.ZodBoolean>;
    primaryKeys: z.ZodDefault<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodString>>;
    schema: z.ZodUnion<[z.ZodEffects<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodEffects<z.ZodString, Record<string, string>, string>]>;
    dataStruct: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    directory: string;
    tableIdArgument: boolean;
    storeArgument: boolean;
    primaryKeys: Record<string, string>;
    schema: Record<string, string>;
    fileSelector?: string | undefined;
    dataStruct?: boolean | undefined;
}, {
    schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
    directory?: string | undefined;
    fileSelector?: string | undefined;
    tableIdArgument?: boolean | undefined;
    storeArgument?: boolean | undefined;
    primaryKeys?: Record<string, string> | undefined;
    dataStruct?: boolean | undefined;
}>, RequireKeys<{
    directory: string;
    tableIdArgument: boolean;
    storeArgument: boolean;
    primaryKeys: Record<string, string>;
    schema: Record<string, string>;
    fileSelector?: string | undefined;
    dataStruct?: boolean | undefined;
}, "dataStruct">, {
    schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
    directory?: string | undefined;
    fileSelector?: string | undefined;
    tableIdArgument?: boolean | undefined;
    storeArgument?: boolean | undefined;
    primaryKeys?: Record<string, string> | undefined;
    dataStruct?: boolean | undefined;
}>, z.ZodEffects<z.ZodString, RequireKeys<{
    directory: string;
    tableIdArgument: boolean;
    storeArgument: boolean;
    primaryKeys: Record<string, string>;
    schema: Record<string, string>;
    fileSelector?: string | undefined;
    dataStruct?: boolean | undefined;
}, "dataStruct">, string>]>>, Record<string, RequireKeys<RequireKeys<{
    directory: string;
    tableIdArgument: boolean;
    storeArgument: boolean;
    primaryKeys: Record<string, string>;
    schema: Record<string, string>;
    fileSelector?: string | undefined;
    dataStruct?: boolean | undefined;
}, "dataStruct">, "fileSelector">>, Record<string, string | {
    schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
    directory?: string | undefined;
    fileSelector?: string | undefined;
    tableIdArgument?: boolean | undefined;
    storeArgument?: boolean | undefined;
    primaryKeys?: Record<string, string> | undefined;
    dataStruct?: boolean | undefined;
}>>;
/************************************************************************
 *
 *    USER TYPES
 *
 ************************************************************************/
type EnumsConfig<EnumNames extends StringForUnion> = never extends EnumNames ? {
    /**
     * Enum names mapped to lists of their member names
     *
     * (enums are inferred to be absent)
     */
    enums?: Record<EnumNames, string[]>;
} : StringForUnion extends EnumNames ? {
    /**
     * Enum names mapped to lists of their member names
     *
     * (enums aren't inferred - use `mudConfig` or `storeConfig` helper, and `as const` for variables)
     */
    enums?: Record<EnumNames, string[]>;
} : {
    /**
     * Enum names mapped to lists of their member names
     *
     * Enums defined here can be used as types in table schemas/keys
     */
    enums: Record<EnumNames, string[]>;
};
declare const zEnumsConfig: z.ZodObject<{
    enums: z.ZodDefault<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">, string[], string[]>>>;
}, "strip", z.ZodTypeAny, {
    enums: Record<string, string[]>;
}, {
    enums?: Record<string, string[]> | undefined;
}>;
/************************************************************************
 *
 *    FINAL
 *
 ************************************************************************/
type StoreUserConfig<EnumNames extends StringForUnion = StringForUnion, StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>> = EnumsConfig<EnumNames> & {
    /** The namespace for table ids. Default is "" (empty string) */
    namespace?: string;
    /** Path for store package imports. Default is "@latticexyz/store/src/" */
    storeImportPath?: string;
    /**
     * Configuration for each table.
     *
     * The key is the table name (capitalized).
     *
     * The value:
     *  - abi or user type for a single-value table.
     *  - FullTableConfig object for multi-value tables (or for customizable options).
     */
    tables: TablesConfig<AsDependent<StaticUserTypes>, AsDependent<StaticUserTypes>>;
    /** Path to the file where common user types will be generated and imported from. Default is "Types" */
    userTypesPath?: string;
};
/** Type helper for defining StoreUserConfig */
declare function storeConfig<EnumNames extends StringForUnion = never, StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>>(config: StoreUserConfig<EnumNames, StaticUserTypes>): StoreUserConfig<EnumNames, StaticUserTypes>;
type StoreConfig = z.output<typeof zStoreConfig>;
declare const zStoreConfig: z.ZodEffects<z.ZodObject<{
    tables: z.ZodEffects<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodUnion<[z.ZodEffects<z.ZodObject<{
        directory: z.ZodDefault<z.ZodString>;
        fileSelector: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
        tableIdArgument: z.ZodDefault<z.ZodBoolean>;
        storeArgument: z.ZodDefault<z.ZodBoolean>;
        primaryKeys: z.ZodDefault<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodString>>;
        schema: z.ZodUnion<[z.ZodEffects<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodString>, Record<string, string>, Record<string, string>>, z.ZodEffects<z.ZodString, Record<string, string>, string>]>;
        dataStruct: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        directory: string;
        tableIdArgument: boolean;
        storeArgument: boolean;
        primaryKeys: Record<string, string>;
        schema: Record<string, string>;
        fileSelector?: string | undefined;
        dataStruct?: boolean | undefined;
    }, {
        schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
        directory?: string | undefined;
        fileSelector?: string | undefined;
        tableIdArgument?: boolean | undefined;
        storeArgument?: boolean | undefined;
        primaryKeys?: Record<string, string> | undefined;
        dataStruct?: boolean | undefined;
    }>, RequireKeys<{
        directory: string;
        tableIdArgument: boolean;
        storeArgument: boolean;
        primaryKeys: Record<string, string>;
        schema: Record<string, string>;
        fileSelector?: string | undefined;
        dataStruct?: boolean | undefined;
    }, "dataStruct">, {
        schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
        directory?: string | undefined;
        fileSelector?: string | undefined;
        tableIdArgument?: boolean | undefined;
        storeArgument?: boolean | undefined;
        primaryKeys?: Record<string, string> | undefined;
        dataStruct?: boolean | undefined;
    }>, z.ZodEffects<z.ZodString, RequireKeys<{
        directory: string;
        tableIdArgument: boolean;
        storeArgument: boolean;
        primaryKeys: Record<string, string>;
        schema: Record<string, string>;
        fileSelector?: string | undefined;
        dataStruct?: boolean | undefined;
    }, "dataStruct">, string>]>>, Record<string, RequireKeys<RequireKeys<{
        directory: string;
        tableIdArgument: boolean;
        storeArgument: boolean;
        primaryKeys: Record<string, string>;
        schema: Record<string, string>;
        fileSelector?: string | undefined;
        dataStruct?: boolean | undefined;
    }, "dataStruct">, "fileSelector">>, Record<string, string | {
        schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
        directory?: string | undefined;
        fileSelector?: string | undefined;
        tableIdArgument?: boolean | undefined;
        storeArgument?: boolean | undefined;
        primaryKeys?: Record<string, string> | undefined;
        dataStruct?: boolean | undefined;
    }>>;
    namespace: z.ZodDefault<z.ZodEffects<z.ZodString, string, string>>;
    storeImportPath: z.ZodDefault<z.ZodString>;
    userTypesPath: z.ZodDefault<z.ZodString>;
    enums: z.ZodDefault<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">, string[], string[]>>>;
}, "strip", z.ZodTypeAny, {
    tables: Record<string, RequireKeys<RequireKeys<{
        directory: string;
        tableIdArgument: boolean;
        storeArgument: boolean;
        primaryKeys: Record<string, string>;
        schema: Record<string, string>;
        fileSelector?: string | undefined;
        dataStruct?: boolean | undefined;
    }, "dataStruct">, "fileSelector">>;
    enums: Record<string, string[]>;
    namespace: string;
    storeImportPath: string;
    userTypesPath: string;
}, {
    tables: Record<string, string | {
        schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
        directory?: string | undefined;
        fileSelector?: string | undefined;
        tableIdArgument?: boolean | undefined;
        storeArgument?: boolean | undefined;
        primaryKeys?: Record<string, string> | undefined;
        dataStruct?: boolean | undefined;
    }>;
    namespace?: string | undefined;
    storeImportPath?: string | undefined;
    userTypesPath?: string | undefined;
    enums?: Record<string, string[]> | undefined;
}>, {
    tables: Record<string, RequireKeys<RequireKeys<{
        directory: string;
        tableIdArgument: boolean;
        storeArgument: boolean;
        primaryKeys: Record<string, string>;
        schema: Record<string, string>;
        fileSelector?: string | undefined;
        dataStruct?: boolean | undefined;
    }, "dataStruct">, "fileSelector">>;
    enums: Record<string, string[]>;
    namespace: string;
    storeImportPath: string;
    userTypesPath: string;
}, {
    tables: Record<string, string | {
        schema: (string | Record<string, string>) & (string | Record<string, string> | undefined);
        directory?: string | undefined;
        fileSelector?: string | undefined;
        tableIdArgument?: boolean | undefined;
        storeArgument?: boolean | undefined;
        primaryKeys?: Record<string, string> | undefined;
        dataStruct?: boolean | undefined;
    }>;
    namespace?: string | undefined;
    storeImportPath?: string | undefined;
    userTypesPath?: string | undefined;
    enums?: Record<string, string[]> | undefined;
}>;
declare function parseStoreConfig(config: unknown): {
    tables: Record<string, RequireKeys<RequireKeys<{
        directory: string;
        tableIdArgument: boolean;
        storeArgument: boolean;
        primaryKeys: Record<string, string>;
        schema: Record<string, string>;
        fileSelector?: string | undefined;
        dataStruct?: boolean | undefined;
    }, "dataStruct">, "fileSelector">>;
    enums: Record<string, string[]>;
    namespace: string;
    storeImportPath: string;
    userTypesPath: string;
};

type SystemUserConfig = {
    /** The full resource selector consists of namespace and fileSelector */
    fileSelector?: string;
    /**
     * Register function selectors for the system in the World.
     * Defaults to true.
     * Note:
     * - For root systems all World function selectors will correspond to the system's function selectors.
     * - For non-root systems, the World function selectors will be <namespace>_<system>_<function>.
     */
    registerFunctionSelectors?: boolean;
} & ({
    /** If openAccess is true, any address can call the system */
    openAccess: true;
} | {
    /** If openAccess is false, only the addresses or systems in `access` can call the system */
    openAccess: false;
    /** An array of addresses or system names that can access the system */
    accessList: string[];
});
type ValueWithType = {
    value: string | number | Uint8Array;
    type: string;
};
type ModuleConfig = {
    /** The name of the module */
    name: string;
    /** Should this module be installed as a root module? */
    root?: boolean;
    /** Arguments to be passed to the module's install method */
    args?: (ValueWithType | DynamicResolution)[];
};
interface WorldUserConfig {
    /** The namespace to register tables and systems at. Defaults to the root namespace (empty string) */
    namespace?: string;
    /** The name of the World contract to deploy. If no name is provided, a vanilla World is deployed */
    worldContractName?: string;
    /**
     * Contracts named *System will be deployed by default
     * as public systems at `namespace/ContractName`, unless overridden
     *
     * The key is the system name (capitalized).
     * The value is a SystemConfig object.
     */
    overrideSystems?: Record<string, SystemUserConfig>;
    /** Systems to exclude from automatic deployment */
    excludeSystems?: string[];
    /**
     * Script to execute after the deployment is complete (Default "PostDeploy").
     * Script must be placed in the forge scripts directory (see foundry.toml) and have a ".s.sol" extension.
     */
    postDeployScript?: string;
    /** Directory to write the deployment info to (Default ".") */
    deploymentInfoDirectory?: string;
    /** Directory to output system and world interfaces of `worldgen` (Default "world") */
    worldgenDirectory?: string;
    /** Path for world package imports. Default is "@latticexyz/world/src/" */
    worldImportPath?: string;
    /** Modules to in the World */
    modules?: ModuleConfig[];
}

declare enum DynamicResolutionType {
    TABLE_ID = 0,
    SYSTEM_ADDRESS = 1
}
type DynamicResolution = {
    type: DynamicResolutionType;
    input: string;
};
/**
 * Dynamically resolve a table name to a table id at deploy time
 */
declare function resolveTableId(tableName: string): {
    type: DynamicResolutionType;
    input: string;
};
/** Type guard for DynamicResolution */
declare function isDynamicResolution(value: unknown): value is DynamicResolution;
/**
 * Turn a DynamicResolution object into a ValueWithType based on the provided context
 */
declare function resolveWithContext(unresolved: any, context: {
    systemAddresses?: Record<string, Promise<string>>;
    tableIds?: Record<string, Uint8Array>;
}): Promise<ValueWithType>;

/**
 * Loads and resolves the world config.
 * @param configPath Path to load the config from. Defaults to "mud.config.mts" or "mud.config.ts"
 * @param existingContracts Optional list of existing contract names to validate system names against. If not provided, no validation is performed. Contract names ending in `System` will be added to the config with default values.
 * @returns Promise of ResolvedWorldConfig object
 */
declare function loadWorldConfig(configPath?: string, existingContracts?: string[]): Promise<{
    systems: Record<string, {
        fileSelector: string;
        registerFunctionSelectors: boolean;
        openAccess: boolean;
        accessListAddresses: string[];
        accessListSystems: string[];
    }>;
    namespace: string;
    postDeployScript: string;
    deploymentInfoDirectory: string;
    worldgenDirectory: string;
    worldImportPath: string;
    modules: {
        name: string;
        root: boolean;
        args: ({
            type: string;
            value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        } | {
            type: DynamicResolutionType;
            input: string;
        })[];
    }[];
    worldContractName?: string | undefined;
}>;

declare const zWorldConfig: z.ZodObject<{
    namespace: z.ZodDefault<z.ZodEffects<z.ZodString, string, string>>;
    worldContractName: z.ZodOptional<z.ZodString>;
    overrideSystems: z.ZodDefault<z.ZodRecord<z.ZodEffects<z.ZodString, string, string>, z.ZodIntersection<z.ZodObject<{
        fileSelector: z.ZodEffects<z.ZodString, string, string>;
        registerFunctionSelectors: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        fileSelector: string;
        registerFunctionSelectors: boolean;
    }, {
        fileSelector: string;
        registerFunctionSelectors?: boolean | undefined;
    }>, z.ZodDiscriminatedUnion<"openAccess", [z.ZodObject<{
        openAccess: z.ZodLiteral<true>;
    }, "strip", z.ZodTypeAny, {
        openAccess: true;
    }, {
        openAccess: true;
    }>, z.ZodObject<{
        openAccess: z.ZodLiteral<false>;
        accessList: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodEffects<z.ZodString, string, string>, z.ZodEffects<z.ZodString, string, string>]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        openAccess: false;
        accessList: string[];
    }, {
        openAccess: false;
        accessList?: string[] | undefined;
    }>]>>>>;
    excludeSystems: z.ZodDefault<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">>;
    postDeployScript: z.ZodDefault<z.ZodString>;
    deploymentInfoDirectory: z.ZodDefault<z.ZodString>;
    worldgenDirectory: z.ZodDefault<z.ZodString>;
    worldImportPath: z.ZodDefault<z.ZodString>;
    modules: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodEffects<z.ZodString, string, string>;
        root: z.ZodDefault<z.ZodBoolean>;
        args: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodObject<{
            value: z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodType<Uint8Array, z.ZodTypeDef, Uint8Array>]>;
            type: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: string;
            value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        }, {
            type: string;
            value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        }>, z.ZodObject<{
            type: z.ZodNativeEnum<typeof DynamicResolutionType>;
            input: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            type: DynamicResolutionType;
            input: string;
        }, {
            type: DynamicResolutionType;
            input: string;
        }>]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        root: boolean;
        args: ({
            type: string;
            value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        } | {
            type: DynamicResolutionType;
            input: string;
        })[];
    }, {
        name: string;
        root?: boolean | undefined;
        args?: ({
            type: string;
            value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        } | {
            type: DynamicResolutionType;
            input: string;
        })[] | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    namespace: string;
    overrideSystems: Record<string, {
        fileSelector: string;
        registerFunctionSelectors: boolean;
    } & ({
        openAccess: true;
    } | {
        openAccess: false;
        accessList: string[];
    })>;
    excludeSystems: string[];
    postDeployScript: string;
    deploymentInfoDirectory: string;
    worldgenDirectory: string;
    worldImportPath: string;
    modules: {
        name: string;
        root: boolean;
        args: ({
            type: string;
            value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        } | {
            type: DynamicResolutionType;
            input: string;
        })[];
    }[];
    worldContractName?: string | undefined;
}, {
    namespace?: string | undefined;
    worldContractName?: string | undefined;
    overrideSystems?: Record<string, {
        fileSelector: string;
        registerFunctionSelectors?: boolean | undefined;
    } & ({
        openAccess: true;
    } | {
        openAccess: false;
        accessList?: string[] | undefined;
    })> | undefined;
    excludeSystems?: string[] | undefined;
    postDeployScript?: string | undefined;
    deploymentInfoDirectory?: string | undefined;
    worldgenDirectory?: string | undefined;
    worldImportPath?: string | undefined;
    modules?: {
        name: string;
        root?: boolean | undefined;
        args?: ({
            type: string;
            value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        } | {
            type: DynamicResolutionType;
            input: string;
        })[] | undefined;
    }[] | undefined;
}>;
declare function parseWorldConfig(config: unknown): Promise<{
    namespace: string;
    overrideSystems: Record<string, {
        fileSelector: string;
        registerFunctionSelectors: boolean;
    } & ({
        openAccess: true;
    } | {
        openAccess: false;
        accessList: string[];
    })>;
    excludeSystems: string[];
    postDeployScript: string;
    deploymentInfoDirectory: string;
    worldgenDirectory: string;
    worldImportPath: string;
    modules: {
        name: string;
        root: boolean;
        args: ({
            type: string;
            value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        } | {
            type: DynamicResolutionType;
            input: string;
        })[];
    }[];
    worldContractName?: string | undefined;
}>;
type ParsedWorldConfig = z.output<typeof zWorldConfig>;

type ResolvedSystemConfig = ReturnType<typeof resolveSystemConfig>;
type ResolvedWorldConfig = ReturnType<typeof resolveWorldConfig>;
/**
 * Resolves the world config by combining the default and overridden system configs,
 * filtering out excluded systems, validate system names refer to existing contracts, and
 * splitting the access list into addresses and system names.
 */
declare function resolveWorldConfig(config: ParsedWorldConfig, existingContracts?: string[]): {
    systems: Record<string, {
        fileSelector: string;
        registerFunctionSelectors: boolean;
        openAccess: boolean;
        accessListAddresses: string[];
        accessListSystems: string[];
    }>;
    namespace: string;
    postDeployScript: string;
    deploymentInfoDirectory: string;
    worldgenDirectory: string;
    worldImportPath: string;
    modules: {
        name: string;
        root: boolean;
        args: ({
            type: string;
            value: (string | number | Uint8Array) & (string | number | Uint8Array | undefined);
        } | {
            type: DynamicResolutionType;
            input: string;
        })[];
    }[];
    worldContractName?: string | undefined;
};
/**
 * Resolves the system config by combining the default and overridden system configs,
 * @param systemName name of the system
 * @param config optional SystemConfig object, if none is provided the default config is used
 * @param existingContracts optional list of existing contract names, used to validate system names in the access list. If not provided, no validation is performed.
 * @returns ResolvedSystemConfig object
 * Default value for fileSelector is `systemName`
 * Default value for registerFunctionSelectors is true
 * Default value for openAccess is true
 * Default value for accessListAddresses is []
 * Default value for accessListSystems is []
 */
declare function resolveSystemConfig(systemName: string, config?: SystemUserConfig, existingContracts?: string[]): {
    fileSelector: string;
    registerFunctionSelectors: boolean;
    openAccess: boolean;
    accessListAddresses: string[];
    accessListSystems: string[];
};

/** Capitalized names of objects, like tables and systems */
declare const zObjectName: z.ZodEffects<z.ZodString, string, string>;
/** Uncapitalized names of values, like keys and columns */
declare const zValueName: z.ZodEffects<z.ZodString, string, string>;
/** Name that can start with any case */
declare const zAnyCaseName: z.ZodEffects<z.ZodString, string, string>;
/** List of unique enum member names and 0 < length < 256 */
declare const zUserEnum: z.ZodEffects<z.ZodArray<z.ZodEffects<z.ZodString, string, string>, "many">, string[], string[]>;
/** Ordinary routes */
declare const zOrdinaryRoute: z.ZodEffects<z.ZodString, string, string>;
/** Routes with exactly 1 non-empty level */
declare const zSingleLevelRoute: z.ZodEffects<z.ZodString, string, string>;
/** Base routes (can be an empty string) */
declare const zBaseRoute: z.ZodEffects<z.ZodString, string, string>;
/** A valid Ethereum address */
declare const zEthereumAddress: z.ZodEffects<z.ZodString, string, string>;
/** A selector for namespace/file/resource */
declare const zSelector: z.ZodEffects<z.ZodString, string, string>;

declare function loadConfig(configPath?: string): Promise<unknown>;

declare function validateName(name: string, ctx: RefinementCtx): void;
declare function validateCapitalizedName(name: string, ctx: RefinementCtx): void;
declare function validateUncapitalizedName(name: string, ctx: RefinementCtx): void;
declare function validateEnum(members: string[], ctx: RefinementCtx): void;
declare const validateRoute: (route: string, ctx: RefinementCtx) => void;
declare const validateBaseRoute: (route: string, ctx: RefinementCtx) => void;
declare const validateSingleLevelRoute: (route: string, ctx: RefinementCtx) => void;
declare function validateEthereumAddress(address: string, ctx: RefinementCtx): void;
declare function getDuplicates<T>(array: T[]): T[];
declare function validateSelector(name: string, ctx: RefinementCtx): void;
/** Returns null if the type does not look like a static array, otherwise element and length data */
declare function parseStaticArray(abiType: string): {
    elementType: string;
    staticLength: number;
} | null;

type MUDUserConfig<EnumNames extends StringForUnion = StringForUnion, StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>> = StoreUserConfig<EnumNames, StaticUserTypes> & WorldUserConfig;
type MUDConfig = StoreConfig & ResolvedWorldConfig;
declare function mudConfig<EnumNames extends StringForUnion = never, StaticUserTypes extends ExtractUserTypes<EnumNames> = ExtractUserTypes<EnumNames>>(config: MUDUserConfig<EnumNames, StaticUserTypes>): MUDUserConfig<EnumNames, StaticUserTypes>;

export { DynamicResolution, DynamicResolutionType, EnumsConfig, FullSchemaConfig, MUDConfig, MUDUserConfig, ModuleConfig, ParsedWorldConfig, ResolvedSystemConfig, ResolvedWorldConfig, SchemaConfig, ShorthandSchemaConfig, StoreConfig, StoreUserConfig, SystemUserConfig, TableConfig, TablesConfig, ValueWithType, WorldUserConfig, getDuplicates, isDynamicResolution, loadConfig, loadStoreConfig, loadWorldConfig, mudConfig, parseStaticArray, parseStoreConfig, parseWorldConfig, resolveSystemConfig, resolveTableId, resolveWithContext, resolveWorldConfig, storeConfig, validateBaseRoute, validateCapitalizedName, validateEnum, validateEthereumAddress, validateName, validateRoute, validateSelector, validateSingleLevelRoute, validateUncapitalizedName, zAnyCaseName, zBaseRoute, zEnumsConfig, zEthereumAddress, zObjectName, zOrdinaryRoute, zSchemaConfig, zSelector, zSingleLevelRoute, zStoreConfig, zTableConfig, zTablesConfig, zUserEnum, zValueName, zWorldConfig };
