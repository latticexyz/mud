import { evaluate, narrow } from "@arktype/util";
import {
  UserTypes,
  Enums,
  StoreConfigInput,
  resolveStoreConfig,
  validateStoreTablesConfig,
  resolveStoreTablesConfig,
  extendedScope,
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

export type NamespaceInput = Pick<StoreConfigInput, "tables">;

export type validateNamespaces<input, scope extends AbiTypeScope = AbiTypeScope> = {
  [namespace in keyof input]: {
    [key in keyof input[namespace]]: key extends "tables"
      ? validateStoreTablesConfig<input[namespace][key], scope>
      : input[namespace][key];
  };
};

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
  // TODO: runtime implementation
  return {} as never;
}
