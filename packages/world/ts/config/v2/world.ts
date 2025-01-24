import { ErrorMessage, conform, show, type withJsDoc } from "@ark/util";
import {
  extendedScope,
  get,
  mergeIfUndefined,
  resolveStore,
  hasOwnKey,
  validateStore,
  flattenNamespacedTables,
  CONFIG_DEFAULTS as STORE_CONFIG_DEFAULTS,
} from "@latticexyz/store/internal";
import { SystemsInput, WorldInput } from "./input";
import { CONFIG_DEFAULTS, MODULE_DEFAULTS } from "./defaults";
import { resolveSystems, validateSystems } from "./systems";
import { resolveNamespaces, validateNamespaces } from "./namespaces";
import { resolveCodegen } from "./codegen";
import { resolveDeploy } from "./deploy";
import type { World } from "./output.js";
import { StoreInput } from "@latticexyz/store";

export type validateWorld<input> = {
  readonly [key in keyof input]: key extends "namespaces"
    ? input extends { namespace?: unknown; tables?: unknown; systems?: unknown }
      ? ErrorMessage<"Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.">
      : validateNamespaces<input[key], extendedScope<input>>
    : key extends "systems"
      ? validateSystems<input[key]>
      : key extends "codegen"
        ? conform<input[key], WorldInput[key] & StoreInput[key]>
        : key extends keyof StoreInput
          ? validateStore<input>[key]
          : key extends keyof WorldInput
            ? conform<input[key], WorldInput[key]>
            : ErrorMessage<`\`${key & string}\` is not a valid World config option.`>;
};

export function validateWorld(input: unknown): asserts input is WorldInput {
  const scope = extendedScope(input);

  if (hasOwnKey(input, "namespaces")) {
    if (hasOwnKey(input, "namespace") || hasOwnKey(input, "tables") || hasOwnKey(input, "systems")) {
      throw new Error("Cannot use `namespaces` with `namespace`, `tables`, or `systems` keys.");
    }
    validateNamespaces(input.namespaces, scope);
  }
  if (hasOwnKey(input, "systems")) {
    validateSystems(input.systems);
  }

  validateStore(input);
}

export type resolveNamespaceMode<input> = "namespaces" extends keyof input
  ? {
      readonly multipleNamespaces: true;
      readonly namespace: null;
      readonly namespaces: show<resolveNamespaces<input["namespaces"], extendedScope<input>>>;
    }
  : {
      readonly multipleNamespaces: false;
      readonly namespace: string;
      readonly namespaces: show<
        resolveNamespaces<
          {
            // TODO: improve this so we don't have to duplicate store behavior
            readonly [label in "namespace" extends keyof input
              ? input["namespace"] extends string
                ? input["namespace"]
                : STORE_CONFIG_DEFAULTS["namespace"]
              : STORE_CONFIG_DEFAULTS["namespace"]]: input;
          },
          extendedScope<input>
        >
      >;
    };

type resolveModules<input> = { [key in keyof input]: mergeIfUndefined<input[key], MODULE_DEFAULTS> };

export type resolveWorld<input> = resolveNamespaceMode<input> &
  Omit<resolveStore<input>, "multipleNamespaces" | "namespace" | "namespaces" | "tables"> & {
    readonly tables: flattenNamespacedTables<resolveNamespaceMode<input>>;
    // TODO: flatten systems from namespaces
    readonly systems: "systems" extends keyof input
      ? input["systems"] extends SystemsInput
        ? resolveNamespaceMode<input>["namespace"] extends string
          ? show<resolveSystems<input["systems"], resolveNamespaceMode<input>["namespace"]>>
          : {}
        : {}
      : {};
    readonly excludeSystems: "excludeSystems" extends keyof input
      ? input["excludeSystems"]
      : CONFIG_DEFAULTS["excludeSystems"];
    readonly modules: "modules" extends keyof input ? resolveModules<input["modules"]> : CONFIG_DEFAULTS["modules"];
    readonly codegen: show<resolveCodegen<"codegen" extends keyof input ? input["codegen"] : {}>>;
    readonly deploy: show<resolveDeploy<"deploy" extends keyof input ? input["deploy"] : {}>>;
  };

export function resolveWorld<const input extends WorldInput>(input: input): resolveWorld<input> {
  const scope = extendedScope(input);
  const store = resolveStore(input);

  const namespaces = input.namespaces
    ? resolveNamespaces(input.namespaces, scope)
    : resolveNamespaces({ [store.namespace!]: input }, scope);

  const tables = flattenNamespacedTables({ namespaces });
  const modules = (input.modules ?? CONFIG_DEFAULTS.modules).map((mod) => mergeIfUndefined(mod, MODULE_DEFAULTS));

  return mergeIfUndefined(
    {
      ...store,
      namespaces,
      tables,
      // TODO: flatten systems from namespaces
      systems:
        !store.multipleNamespaces && input.systems
          ? resolveSystems(input.systems, store.namespace, store.namespace)
          : CONFIG_DEFAULTS.systems,
      excludeSystems: get(input, "excludeSystems"),
      codegen: mergeIfUndefined(store.codegen, resolveCodegen(input.codegen)),
      deploy: resolveDeploy(input.deploy),
      modules,
    },
    CONFIG_DEFAULTS,
  ) as never;
}

export function defineWorld<const input>(input: validateWorld<input>): withJsDoc<resolveWorld<input>, World> {
  validateWorld(input);
  return resolveWorld(input) as never;
}
