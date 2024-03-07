import { evaluate } from "@arktype/util";
import { UserTypes, Enums, StoreConfigInput, validateStoreConfig, resolveStoreConfig } from "@latticexyz/store/config";

export type WorldConfigInput<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = evaluate<
  StoreConfigInput<userTypes, enums> & {
    namespaces?: NamespacesInput;
  }
>;

export type NamespacesInput = { [key: string]: NamespaceInput };

export type NamespaceInput = Omit<StoreConfigInput, "userTypes" | "enums">;

export type validateNamespaces<input> = {
  [key in keyof input]: validateStoreConfig<input[key]>;
};

export type validateWorldConfig<input> = validateStoreConfig<input> & {
  [key in keyof input]: key extends "namespaces" ? validateNamespaces<input[key]> : input[key];
};

export type resolveWorldConfig<input> = resolveStoreConfig<input>;

export function resolveWorldConfig<input>(input: validateWorldConfig<input>): resolveWorldConfig<input> {
  // TODO: runtime implementation
  return {} as never;
}
