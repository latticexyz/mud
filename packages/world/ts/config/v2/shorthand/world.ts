import {
  AbiTypeScope,
  Enums,
  StoreConfigInputWithShorthands,
  UserTypes,
  extendedScope,
  isTableShorthandInput,
  resolveTableShorthand,
  resolveTablesWithShorthands,
  validateStoreWithShorthandsTables,
  validateTableShorthand,
} from "@latticexyz/store/config/v2";
import { resolveWorldConfig, validateNamespaces, validateWorldConfig } from "../world";
import { WorldConfigInput } from "../input";
import { mapObject } from "@latticexyz/common/utils";

export type WorldConfigInputWithShorthands<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = Omit<
  WorldConfigInput<userTypes, enums>,
  "tables"
> &
  Pick<StoreConfigInputWithShorthands<userTypes, enums>, "tables">;

export type resolveWorldWithShorthands<input> = resolveWorldConfig<{
  [key in keyof input]: key extends "tables"
    ? resolveTablesWithShorthands<input[key], extendedScope<input>>
    : key extends "namespaces"
      ? {
          [namespaceKey in keyof input[key]]: {
            [namespaceProp in keyof input[key][namespaceKey]]: namespaceProp extends "tables"
              ? resolveTablesWithShorthands<input[key][namespaceKey][namespaceProp], extendedScope<input>>
              : input[key][namespaceKey][namespaceProp];
          };
        }
      : input[key];
}>;

export type validateWorldWithShorthands<input> = {
  [key in keyof input]: key extends "tables"
    ? validateStoreWithShorthandsTables<input[key], extendedScope<input>>
    : key extends "namespaces"
      ? validateNamespacesWithShorthands<input[key], extendedScope<input>>
      : validateWorldConfig<input>[key];
};

function validateWorldWithShorthands(input: unknown): asserts input is WorldConfigInputWithShorthands {
  //
}

export type validateNamespacesWithShorthands<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [namespace in keyof input]: {
    [key in keyof input[namespace]]: key extends "tables"
      ? validateStoreWithShorthandsTables<input[namespace][key], scope>
      : validateNamespaces<input[namespace], scope>[key];
  };
};

export function resolveWorldWithShorthands<input>(
  input: validateWorldWithShorthands<input>,
): resolveWorldWithShorthands<input> {
  validateWorldWithShorthands(input);

  const scope = extendedScope(input);
  const tables = mapObject(input.tables ?? {}, (table) => {
    return isTableShorthandInput(table, scope)
      ? resolveTableShorthand(table as validateTableShorthand<typeof table, typeof scope>, scope)
      : table;
  });
  const namespaces = mapObject(input.namespaces ?? {}, (namespace) => ({
    ...namespace,
    tables: mapObject(namespace.tables ?? {}, (table) => {
      return isTableShorthandInput(table, scope)
        ? resolveTableShorthand(table as validateTableShorthand<typeof table, typeof scope>, scope)
        : table;
    }),
  }));

  const fullConfig = { ...input, tables, namespaces };

  return resolveWorldConfig(
    fullConfig as validateWorldConfig<typeof fullConfig>,
  ) as unknown as resolveWorldWithShorthands<input>;
}
