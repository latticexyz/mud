import { evaluate, narrow } from "@arktype/util";
import { resourceToHex } from "@latticexyz/common";
import { mapObject } from "@latticexyz/common/utils";
import {
  UserTypes,
  Enums,
  StoreConfigInput,
  resolveStoreConfig,
  resolveStoreTablesConfig,
  extendedScope,
  resolveTableConfig,
  AbiTypeScope,
  get,
  isTableShorthandInput,
  resolveTableShorthand,
  validateTableShorthand,
  resolveTableFullConfig,
  validateStoreTablesConfig,
  validateTableFull,
  isObject,
  hasOwnKey,
  Table,
} from "@latticexyz/store/config/v2";
import { Config } from "./output";

export type WorldConfigInput<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = evaluate<
  StoreConfigInput<userTypes, enums> & {
    namespaces?: NamespacesInput;
  }
>;

export type NamespacesInput = { [key: string]: NamespaceInput };

export type NamespaceInput = Pick<StoreConfigInput, "tables">;

export type validateNamespaces<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [namespace in keyof input]: {
    [key in keyof input[namespace]]: key extends "tables"
      ? validateStoreTablesConfig<input[namespace][key], scope>
      : input[namespace][key];
  };
};

function validateNamespaces<scope extends AbiTypeScope = AbiTypeScope>(
  input: unknown,
  scope: scope,
): asserts input is NamespacesInput {
  if (isObject(input)) {
    for (const namespace of Object.values(input)) {
      if (!hasOwnKey(namespace, "tables")) {
        throw new Error(`Expected namespace config, received ${JSON.stringify(namespace)}`);
      }
      validateStoreTablesConfig(namespace.tables, scope);
    }
    return;
  }
  throw new Error(`Expected namespaces config, received ${JSON.stringify(input)}`);
}

export type validateWorldConfig<input> = {
  readonly [key in keyof input]: key extends "tables"
    ? validateStoreTablesConfig<input[key], extendedScope<input>>
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<input[key]>
        : key extends "namespaces"
          ? validateNamespaces<input[key], extendedScope<input>>
          : input[key];
};

export type namespacedTableKeys<input> = "namespaces" extends keyof input
  ? "tables" extends keyof input["namespaces"][keyof input["namespaces"]]
    ? `${keyof input["namespaces"] & string}__${keyof input["namespaces"][keyof input["namespaces"]]["tables"] &
        string}`
    : never
  : never;

export type resolveWorldConfig<input> = evaluate<
  resolveStoreConfig<input> & {
    readonly tables: "namespaces" extends keyof input
      ? {
          readonly [key in namespacedTableKeys<input>]: key extends `${infer namespace}__${infer table}`
            ? resolveTableConfig<
                get<get<get<get<input, "namespaces">, namespace>, "tables">, table>,
                extendedScope<input>
              >
            : never;
        }
      : {};
    readonly namespaces: "namespaces" extends keyof input
      ? {
          [key in keyof input["namespaces"]]: {
            readonly tables: resolveStoreTablesConfig<get<input["namespaces"][key], "tables">, extendedScope<input>>;
          };
        }
      : {};
  }
>;

export function resolveWorldConfig<const input>(input: validateWorldConfig<input>): resolveWorldConfig<input> {
  const scope = extendedScope(input);

  const namespaces = get(input, "namespaces") ?? {};
  validateNamespaces(namespaces, scope);

  const rootTables = get(input, "tables") ?? {};
  validateStoreTablesConfig(rootTables, scope);

  const resolvedNamespaces = mapObject(namespaces, (namespace, namespaceKey) => ({
    tables: mapObject(namespace.tables, (table, tableKey) => {
      const fullInput = isTableShorthandInput(table, scope)
        ? resolveTableShorthand(table as validateTableShorthand<typeof table, typeof scope>, scope)
        : table;
      validateTableFull(fullInput, scope);
      return resolveTableFullConfig(
        {
          // if a tableId exists on the input, keep that tableId
          tableId: resourceToHex({ type: "table", namespace: namespaceKey as string, name: tableKey as string }),
          ...fullInput,
        },
        scope,
      ) as Table;
    }) as Config["namespaces"][string]["tables"],
  })) as Config["namespaces"];

  const resolvedNamespacedTables = Object.fromEntries(
    Object.entries(resolvedNamespaces)
      .map(([namespaceKey, namespace]) =>
        Object.entries(namespace.tables).map(([tableKey, table]) => [`${namespaceKey}__${tableKey}`, table]),
      )
      .flat(),
  ) as Config["tables"];

  const resolvedRootTables = resolveStoreTablesConfig(rootTables, scope);

  return {
    tables: { ...resolvedRootTables, ...resolvedNamespacedTables },
    namespaces: resolvedNamespaces,
    userTypes: get(input, "userTypes") ?? {},
    enums: get(input, "enums") ?? {},
    namespace: get(input, "namespace") ?? "",
  } as resolveWorldConfig<input>;
}
