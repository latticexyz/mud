import { resolveStoreConfig, validateStoreConfig } from "../store";

export type resolveStoreWithShorthands<input> = resolveStoreConfig<input>;

export function resolveStoreWithShorthands<input>(
  input: validateStoreConfig<input>,
): resolveStoreWithShorthands<input> {
  return resolveStoreConfig(input);
}
