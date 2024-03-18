import { conform, evaluate, narrow } from "@arktype/util";
import { mapObject } from "@latticexyz/common/utils";
import {
  UserTypes,
  extendedScope,
  AbiTypeScope,
  get,
  resolveTable,
  validateTable,
  isObject,
  hasOwnKey,
  resolveCodegen as resolveStoreCodegen,
  mergeIfUndefined,
  Scope,
  validateTables,
  resolveStore,
  resolveTables,
} from "@latticexyz/store/config/v2";
import { NamespacesInput, SystemsInput, WorldInput } from "./input";
import { DEPLOYMENT_DEFAULTS, CODEGEN_DEFAULTS, CONFIG_DEFAULTS, SYSTEM_DEFAULTS } from "./defaults";
import { Tables } from "@latticexyz/store";

export type validateNamespaces<namespaces, scope extends Scope = AbiTypeScope> = {
  [namespace in keyof namespaces]: {
    [key in keyof namespaces[namespace]]: key extends "tables"
      ? validateTables<namespaces[namespace][key], scope>
      : namespaces[namespace][key];
  };
};

export function validateNamespaces<scope extends Scope = AbiTypeScope>(
  namespaces: unknown,
  scope: scope,
): asserts namespaces is NamespacesInput {
  if (isObject(namespaces)) {
    for (const namespace of Object.values(namespaces)) {
      if (!hasOwnKey(namespace, "tables")) {
        throw new Error(`Expected namespace config, received ${JSON.stringify(namespace)}`);
      }
      validateTables(namespace.tables, scope);
    }
    return;
  }
  throw new Error(`Expected namespaces config, received ${JSON.stringify(namespaces)}`);
}

export type validateWorld<world> = {
  readonly [key in keyof world]: key extends "tables"
    ? validateTables<world[key], extendedScope<world>>
    : key extends "userTypes"
      ? UserTypes
      : key extends "enums"
        ? narrow<world[key]>
        : key extends "namespaces"
          ? validateNamespaces<world[key], extendedScope<world>>
          : key extends keyof WorldInput
            ? conform<world[key], WorldInput[key]>
            : world[key];
};

export type namespacedTableKeys<world> = "namespaces" extends keyof world
  ? "tables" extends keyof world["namespaces"][keyof world["namespaces"]]
    ? `${keyof world["namespaces"] & string}__${keyof world["namespaces"][keyof world["namespaces"]]["tables"] &
        string}`
    : never
  : never;

// TODO: can we use mergeIfUndefined here?
export type resolveDeployment<deployment> = {
  readonly customWorldContract: "customWorldContract" extends keyof deployment
    ? deployment["customWorldContract"]
    : typeof DEPLOYMENT_DEFAULTS.customWorldContract;
  readonly postDeployScript: "postDeployScript" extends keyof deployment
    ? deployment["postDeployScript"]
    : typeof DEPLOYMENT_DEFAULTS.postDeployScript;
  readonly deploysDirectory: "deploysDirectory" extends keyof deployment
    ? deployment["deploysDirectory"]
    : typeof DEPLOYMENT_DEFAULTS.deploysDirectory;
  readonly worldsFile: "worldsFile" extends keyof deployment
    ? deployment["worldsFile"]
    : typeof DEPLOYMENT_DEFAULTS.worldsFile;
};

export function resolveDeployment<deployment>(deployment: deployment): resolveDeployment<deployment> {
  return {
    customWorldContract: get(deployment, "customWorldContract") ?? DEPLOYMENT_DEFAULTS.customWorldContract,
    postDeployScript: get(deployment, "postDeployScript") ?? DEPLOYMENT_DEFAULTS.postDeployScript,
    deploysDirectory: get(deployment, "deploysDirectory") ?? DEPLOYMENT_DEFAULTS.deploysDirectory,
    worldsFile: get(deployment, "worldsFile") ?? DEPLOYMENT_DEFAULTS.worldsFile,
  } as resolveDeployment<deployment>;
}

export type resolveCodegen<codegen> = {
  readonly worldInterfaceName: "worldInterfaceName" extends keyof codegen
    ? codegen["worldInterfaceName"]
    : typeof CODEGEN_DEFAULTS.worldInterfaceName;
  readonly worldgenDirectory: "worldgenDirectory" extends keyof codegen
    ? codegen["worldgenDirectory"]
    : typeof CODEGEN_DEFAULTS.worldgenDirectory;
  readonly worldImportPath: "worldImportPath" extends keyof codegen
    ? codegen["worldImportPath"]
    : typeof CODEGEN_DEFAULTS.worldImportPath;
};

export function resolveCodegen<codegen>(codegen: codegen): resolveCodegen<codegen> {
  return {
    worldInterfaceName: get(codegen, "worldInterfaceName") ?? CODEGEN_DEFAULTS.worldInterfaceName,
    worldgenDirectory: get(codegen, "worldgenDirectory") ?? CODEGEN_DEFAULTS.worldgenDirectory,
    worldImportPath: get(codegen, "worldImportPath") ?? CODEGEN_DEFAULTS.worldImportPath,
  } as resolveCodegen<codegen>;
}

export type resolveSystems<systems extends SystemsInput> = {
  [system in keyof systems]: {
    readonly name: systems[system]["name"];
    readonly registerFunctionSelectors: systems[system]["registerFunctionSelectors"] extends undefined
      ? typeof SYSTEM_DEFAULTS.registerFunctionSelectors
      : systems[system]["registerFunctionSelectors"];
    readonly openAccess: systems[system]["openAccess"] extends undefined
      ? typeof SYSTEM_DEFAULTS.openAccess
      : systems[system]["openAccess"];
    readonly accessList: systems[system]["accessList"] extends undefined
      ? typeof SYSTEM_DEFAULTS.accessList
      : systems[system]["accessList"];
  };
};

export function resolveSystems<systems extends SystemsInput>(systems: systems): resolveSystems<systems> {
  return mapObject(
    systems,
    (system) =>
      ({
        name: system.name,
        registerFunctionSelectors: system.registerFunctionSelectors ?? SYSTEM_DEFAULTS.registerFunctionSelectors,
        openAccess: system.openAccess ?? SYSTEM_DEFAULTS.openAccess,
        accessList: system.accessList ?? SYSTEM_DEFAULTS.accessList,
      }) as resolveSystems<systems>[keyof systems],
  );
}

export type resolveWorld<world> = evaluate<
  resolveStore<world> & {
    readonly tables: "namespaces" extends keyof world
      ? {
          readonly [key in namespacedTableKeys<world>]: key extends `${infer namespace}__${infer table}`
            ? resolveTable<
                mergeIfUndefined<
                  get<get<get<get<world, "namespaces">, namespace>, "tables">, table>,
                  { name: table; namespace: namespace }
                >,
                extendedScope<world>
              >
            : never;
        }
      : {};
    readonly systems: "systems" extends keyof world ? world["systems"] : typeof CONFIG_DEFAULTS.systems;
    readonly excludeSystems: "excludeSystems" extends keyof world
      ? world["excludeSystems"]
      : typeof CONFIG_DEFAULTS.excludeSystems;
    readonly modules: "modules" extends keyof world ? world["modules"] : typeof CONFIG_DEFAULTS.modules;
    readonly deployment: resolveDeployment<"deployment" extends keyof world ? world["deployment"] : {}>;
    readonly codegen: resolveCodegen<"codegen" extends keyof world ? world["codegen"] : {}>;
  }
>;

export function resolveWorld<const world>(world: world): resolveWorld<world> {
  const scope = extendedScope(world);
  const namespace = get(world, "namespace") ?? "";

  const namespaces = get(world, "namespaces") ?? {};
  validateNamespaces(namespaces, scope);

  const rootTables = get(world, "tables") ?? {};
  validateTables(rootTables, scope);

  const resolvedNamespacedTables = Object.fromEntries(
    Object.entries(namespaces)
      .map(([namespaceKey, namespace]) =>
        Object.entries(namespace.tables).map(([tableKey, table]) => {
          validateTable(table, scope);
          return [
            `${namespaceKey}__${tableKey}`,
            resolveTable(mergeIfUndefined(table, { namespace: namespaceKey, name: tableKey }), scope),
          ];
        }),
      )
      .flat(),
  ) as Tables;

  const resolvedRootTables = resolveTables(
    mapObject(rootTables, (table) => mergeIfUndefined(table, { namespace })),
    scope,
  );

  return {
    tables: { ...resolvedRootTables, ...resolvedNamespacedTables },
    userTypes: get(world, "userTypes") ?? {},
    enums: get(world, "enums") ?? {},
    namespace,
    codegen: { ...resolveStoreCodegen(get(world, "codegen")), ...resolveCodegen(get(world, "codegen")) },
    deployment: resolveDeployment(get(world, "deployment")),
    systems: resolveSystems(get(world, "systems") ?? CONFIG_DEFAULTS.systems),
    excludeSystems: get(world, "excludeSystems") ?? CONFIG_DEFAULTS.excludeSystems,
    modules: get(world, "modules") ?? CONFIG_DEFAULTS.modules,
  } as unknown as resolveWorld<world>;
}

export function defineWorld<const world>(world: validateWorld<world>): resolveWorld<world> {
  return resolveWorld(world) as unknown as resolveWorld<world>;
}
