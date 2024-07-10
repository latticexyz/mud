import { ErrorMessage, conform, evaluate, narrow } from "@arktype/util";
import {
  UserTypes,
  extendedScope,
  get,
  mergeIfUndefined,
  resolveStore,
  Store,
  hasOwnKey,
  validateStore,
  resolveNamespaces,
  validateNamespaces,
  validateTables,
  NamespaceInput,
} from "@latticexyz/store/config/v2";
import { SystemsInput, WorldInput } from "./input";
import { CONFIG_DEFAULTS, MODULE_DEFAULTS } from "./defaults";
import { resolveSystems } from "./systems";
import { resolveCodegen } from "./codegen";
import { resolveDeploy } from "./deploy";

// Ideally we'd be able to use an intersection of `validateNamespace<input> & { key in keyof input]: ... }`
// to avoid duplicating logic, but TS doesn't work well when mapping over types like that.
// TODO: fill in more reasons why
export type validateWorld<input> = {
  readonly [key in keyof input]: key extends "tables"
    ? validateTables<input[key], extendedScope<input>>
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<input[key]>
        : key extends "namespaces"
          ? input extends { [k in keyof NamespaceInput]?: unknown }
            ? ErrorMessage<"Cannot use `namespaces` key with `namespace`, `tables` keys.">
            : validateNamespaces<input[key], extendedScope<input>>
          : key extends keyof WorldInput
            ? // TODO: why do we use conform here and not in the same line as validateStore?
              conform<input[key], WorldInput[key]>
            : ErrorMessage<`\`${key & string}\` is not a valid World config option.`>;
};

export function validateWorld(world: unknown): asserts world is WorldInput {
  const scope = extendedScope(world);
  validateStore(world);

  if (hasOwnKey(world, "namespaces")) {
    if (hasOwnKey(world, "namespace") || hasOwnKey(world, "tables")) {
      throw new Error("Cannot use `namespaces` key with `namespace`, `tables` keys.");
    }
    validateNamespaces(world.namespaces, scope);
  }
}

type resolveWorldSingleNamespaceMode<world> = resolveStore<world> & {
  readonly multipleNamespaces: false;
} & mergeIfUndefined<
    {
      [key in Exclude<keyof world, keyof Store>]: key extends "systems"
        ? // TODO: rework resolveSystems to not need this intersection type
          resolveSystems<world[key] & SystemsInput>
        : key extends "deploy"
          ? resolveDeploy<world[key]>
          : key extends "codegen"
            ? resolveCodegen<world[key]>
            : world[key];
    },
    CONFIG_DEFAULTS
  >;

export type resolveWorldMultipleNamespaceMode<world> = world extends WorldInput
  ? Omit<resolveStore<world>, "namespace" | "tables"> & {
      readonly multipleNamespaces: true;
      readonly namespace: undefined;
      readonly tables: undefined;
      readonly namespaces: resolveNamespaces<world["namespaces"], extendedScope<world>>;
      readonly systems: "systems" extends keyof world
        ? // TODO: rework resolveSystems to not need this intersection type
          resolveSystems<world["systems"] & SystemsInput>
        : CONFIG_DEFAULTS["systems"];
      readonly deploy: "deploy" extends keyof world ? resolveDeploy<world["deploy"]> : CONFIG_DEFAULTS["deploy"];
      readonly codegen: "codegen" extends keyof world ? resolveCodegen<world["codegen"]> : CONFIG_DEFAULTS["codegen"];
      readonly excludeSystems: "excludeSystems" extends keyof world
        ? world["excludeSystems"]
        : CONFIG_DEFAULTS["excludeSystems"];
      readonly modules: "modules" extends keyof world ? world["modules"] : CONFIG_DEFAULTS["modules"];
    }
  : never;

export type resolveWorld<world> = "namespaces" extends keyof world
  ? resolveWorldMultipleNamespaceMode<world>
  : resolveWorldSingleNamespaceMode<world>;

export function resolveWorld<const world extends WorldInput>(world: world): resolveWorld<world> {
  const resolvedStore = resolveStore(world);

  // TODO: move namespace resolving into store
  const multipleNamespaces = world.namespaces != null;
  const namespaces = resolveNamespaces(world.namespaces ?? CONFIG_DEFAULTS.namespaces, extendedScope(world));
  const modules = (world.modules ?? CONFIG_DEFAULTS.modules).map((mod) => mergeIfUndefined(mod, MODULE_DEFAULTS));

  return {
    ...resolvedStore,
    multipleNamespaces,
    namespace: multipleNamespaces ? undefined : resolvedStore.namespace,
    tables: multipleNamespaces ? undefined : resolvedStore.tables,
    namespaces,
    codegen: {
      ...resolvedStore.codegen,
      ...resolveCodegen(world.codegen),
    },
    deploy: resolveDeploy(world.deploy),
    systems: resolveSystems(world.systems ?? CONFIG_DEFAULTS.systems),
    excludeSystems: get(world, "excludeSystems") ?? CONFIG_DEFAULTS.excludeSystems,
    modules,
  } as never;
}

export function defineWorld<const world>(world: validateWorld<world>): evaluate<resolveWorld<world>> {
  validateWorld(world);
  return resolveWorld(world) as never;
}
