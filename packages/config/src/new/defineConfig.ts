// --- Types shared between the input and output of the config

import { SchemaAbiType, StaticAbiType } from "@latticexyz/schema-type";

interface PluginConfig {
  resolveConfig: <TConfigInput extends ConfigInput>(config: TConfigInput) => TConfigInput & ConfigOutput<TConfigInput>;
}

interface PluginsConfigInput {
  [key: string]: PluginConfig;
}

interface PluginsConfigOutput {
  [key: string]: PluginConfig;
}

interface ConfigInput {
  plugins: PluginsConfigInput;
}

interface ConfigOutput<TConfigInput extends ConfigInput> {
  plugins: TConfigInput["plugins"] & PluginsConfigOutput;
}

// --- Implementation

export function defineConfig<TConfigInput extends ConfigInput>(
  configInput: TConfigInput
): TConfigInput & ConfigOutput<TConfigInput> {
  return Object.values(configInput.plugins).reduce(
    (config, plugin) => plugin.resolveConfig(config),
    configInput
  ) as TConfigInput & ConfigOutput<TConfigInput>;
}

// --- Store config (to be moved to packages/store)

interface KeySchema {
  [key: string]: StaticAbiType;
}

interface ValueSchema {
  [key: string]: SchemaAbiType;
}

interface TableConfigInput {
  directory?: string;
  name?: string;
  tableIdArgument?: boolean;
  storeArgument?: boolean;
  dataStruct?: boolean;
  offchainOnly?: boolean;
  keySchema?: KeySchema;
  valueSchema?: ValueSchema;
}

interface TableConfigOutput<TConfigInput extends ConfigInput> {
  directory: string;
  name: string;
  tableIdArgument: boolean;
  storeArgument: boolean;
  dataStruct: boolean;
  offchainOnly: boolean;
  keySchema: KeySchema;
  valueSchema: ValueSchema;
}

interface TablesConfigInput {
  [key: string]: TableConfigInput;
}

interface TablesConfigOutput<TConfigInput extends ConfigInput> {
  [key: string]: TableConfigOutput<TConfigInput>;
}

interface EnumsConfigInput {
  [key: string]: string[];
}

interface EnumsConfigOutput {
  [key: string]: string[];
}

interface UserTypeConfigInput {
  filePath: string;
  internalType: string;
}

interface UserTypeConfigOutput {
  filePath: string;
  internalType: string;
}

interface UserTypesConfigInput {
  [key: string]: UserTypeConfigInput;
}

interface UserTypesConfigOutput {
  [key: string]: UserTypeConfigOutput;
}

interface ConfigInput {
  tables?: TablesConfigInput;
  enums?: EnumsConfigInput;
  userTypes?: UserTypesConfigInput;
}

interface ConfigOutput<TConfigInput extends ConfigInput> {
  tables: TConfigInput["tables"] & TablesConfigOutput<TConfigInput>;
  enums: TConfigInput["enums"] & EnumsConfigOutput;
  userTypes: TConfigInput["userTypes"] & UserTypesConfigOutput;
}

// -- World config (to be moved to packages/world)
interface NamespaceConfigInput {
  tables?: TablesConfigInput;
}

interface NamespaceConfigOutput {
  tables?: TablesConfigInput;
}

interface NamespacesConfigInput {
  [key: string]: NamespaceConfigInput;
}

interface NamespacesConfigOutput {
  [key: string]: NamespaceConfigOutput;
}

interface ConfigInput {
  namespaces?: NamespacesConfigInput;
}

// Helper type to go from table nested in namespace to namespace_table
type PrefixKeys<TRecord extends Record<string, unknown> | undefined, Prefix extends string> = TRecord extends undefined
  ? undefined
  : {
      [key in keyof TRecord & string as `${Prefix}_${key}`]: TRecord[key];
    };

// From https://github.com/sindresorhus/type-fest/blob/113400b53a3b20eac75466b8e0ecc1bbb983e56f/source/union-to-intersection.d.ts#L46
// TODO: import type-fest
export type UnionToIntersection<Union> = // `extends unknown` is always going to be the case and is used to convert the
  // `Union` into a [distributive conditional
  // type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
  (
    Union extends unknown
      ? // The union type is used as the only argument to a function since the union
        // of function arguments is an intersection.
        (distributedUnion: Union) => void
      : // This won't happen.
        never
  ) extends // Infer the `Intersection` type since TypeScript represents the positional
  // arguments of unions of functions as an intersection of the union.
  (mergedIntersection: infer Intersection) => void
    ? Intersection
    : never;

type FlattenNamespacesConfig<TNamespacesConfig extends NamespacesConfigInput | undefined> =
  TNamespacesConfig extends NamespacesConfigInput
    ? UnionToIntersection<
        {
          [TNamespace in keyof TNamespacesConfig & string]: PrefixKeys<
            TNamespacesConfig[TNamespace]["tables"],
            TNamespace
          >;
        }[keyof TNamespacesConfig & string]
      >
    : never;

interface ConfigOutput<TConfigInput extends ConfigInput> {
  namespaces: TConfigInput["namespaces"] & NamespacesConfigOutput;
  tables: TConfigInput["tables"] & TablesConfigOutput<TConfigInput>;
}

//--------- Testing

const config = defineConfig({
  tables: {
    foo: {
      name: "foo",
    },
    bar: {
      name: "bar",
    },
  },
  namespaces: {
    namespace1: {
      tables: {
        foo: {
          name: "namespaced_foo",
        },
      },
    },
  },
  plugins: {},
} as const);

config.tables.foo.name;
//                 ^?

config.tables.bar.name;
//                 ^?

config.tables;
//         ^?
