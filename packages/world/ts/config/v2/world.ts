import { conform, evaluate, narrow } from "@arktype/util";
import {
  UserTypes,
  Enums,
  StoreConfigInput,
  validateStoreConfig,
  resolveStoreConfig,
  validateStoreTablesConfig,
  scopeWithEnums,
  scopeWithUserTypes,
  StoreTablesConfigInput,
} from "@latticexyz/store/config";
import { get } from "@latticexyz/store/ts/config/v2/generics";
import { AbiTypeScope } from "@latticexyz/store/ts/config/v2/scope";
import { resolveTableConfig } from "@latticexyz/store/ts/config/v2/table";

export type WorldConfigInput<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = evaluate<
  StoreConfigInput<userTypes, enums> & {
    namespaces?: NamespacesInput;
  }
>;

export type NamespacesInput = { [key: string]: NamespaceInput };

export type NamespaceInput = Omit<StoreConfigInput, "userTypes" | "enums">;

export type validateNamespaces<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [key in keyof input]: {
    tables: "tables" extends keyof input[key]
      ? validateStoreTablesConfig<get<input[key], "tables">, scope>
      : StoreTablesConfigInput<scope>;
  };
};

// TODO: what's the right way to extend validators like here?
// I want the world config to be a superset of the store config:
// validate all top level keys like the
// export type validateWorldConfig<input> = conform<
//   input,
//   validateStoreConfig<input> & {
//     namespaces?: "namespaces" extends keyof input
//       ? validateNamespaces<
//           input["namespaces"],
//           scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>
//         >
//       : never;
//   }
// >;

export type validateWorldConfig<input> = {
  [key in keyof input]: key extends "tables"
    ? validateStoreTablesConfig<
        input[key],
        scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>
      >
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<input[key]>
        : key extends "namespaces"
          ? validateNamespaces<
              input[key],
              scopeWithEnums<get<input, "enums">, scopeWithUserTypes<get<input, "userTypes">>>
            >
          : input[key];
};

export type namespacedTableKeys<input> = "namespaces" extends keyof input
  ? "tables" extends keyof input["namespaces"][keyof input["namespaces"]]
    ? `${keyof input["namespaces"] & string}__${keyof input["namespaces"][keyof input["namespaces"]]["tables"] & string}`
    : never
  : never;

export type resolveWorldConfig<input> = resolveStoreConfig<input> & {
  tables: "namespaces" extends keyof input
    ? {
        [key in namespacedTableKeys<input>]: key extends `${infer namespace}__${infer table}`
          ? resolveTableConfig<get<get<get<get<input, "namespaces">, namespace>, "tables">, table>>
          : never;
      }
    : never;
};

export function resolveWorldConfig<input>(input: validateWorldConfig<input>): resolveWorldConfig<input> {
  // TODO: runtime implementation
  return {} as never;
}
