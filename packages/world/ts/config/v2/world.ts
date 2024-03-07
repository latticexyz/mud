import { UserTypes, Enums, StoreConfigInput, validateStoreConfig, resolveStoreConfig } from "@latticexyz/store/config";

export type WorldConfigInput<userTypes extends UserTypes = UserTypes, enums extends Enums = Enums> = StoreConfigInput<
  userTypes,
  enums
>;

export type validateWorldConfig<input> = validateStoreConfig<input>;

export type resolveWorldConfig<input> = resolveStoreConfig<input>;

export function resolveWorldConfig<input>(input: validateWorldConfig<input>): resolveWorldConfig<input> {
  // TODO: runtime implementation
  return {} as never;
}
