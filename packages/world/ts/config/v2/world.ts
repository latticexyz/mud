import { conform, evaluate, narrow } from "@arktype/util";
import { resourceToHex } from "@latticexyz/common";
import { mapObject } from "@latticexyz/common/utils";
import {
  UserTypes,
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
  resolveCodegen as resolveStoreCodegen,
} from "@latticexyz/store/config/v2";
import { Config } from "./output";
import { NamespacesInput, WorldConfigInput } from "./input";
import { DEPLOYMENT_DEFAULTS, CODEGEN_DEFAULTS, CONFIG_DEFAULTS } from "./defaults";

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
          : key extends keyof WorldConfigInput
            ? conform<input[key], WorldConfigInput[key]>
            : input[key];
};

export type namespacedTableKeys<input> = "namespaces" extends keyof input
  ? "tables" extends keyof input["namespaces"][keyof input["namespaces"]]
    ? `${keyof input["namespaces"] & string}__${keyof input["namespaces"][keyof input["namespaces"]]["tables"] &
        string}`
    : never
  : never;

export type resolveDeploymentConfig<input> = {
  readonly worldContractName: "worldContractName" extends keyof input
    ? input["worldContractName"]
    : typeof DEPLOYMENT_DEFAULTS.worldContractName;
  readonly postDeployScript: "postDeployScript" extends keyof input
    ? input["postDeployScript"]
    : typeof DEPLOYMENT_DEFAULTS.postDeployScript;
  readonly deploysDirectory: "deploysDirectory" extends keyof input
    ? input["deploysDirectory"]
    : typeof DEPLOYMENT_DEFAULTS.deploysDirectory;
  readonly worldsFile: "worldsFile" extends keyof input ? input["worldsFile"] : typeof DEPLOYMENT_DEFAULTS.worldsFile;
};

export function resolveDeploymentConfig<input>(input: input): resolveDeploymentConfig<input> {
  return {
    worldContractName: get(input, "worldContractName") ?? DEPLOYMENT_DEFAULTS.worldContractName,
    postDeployScript: get(input, "postDeployScript") ?? DEPLOYMENT_DEFAULTS.postDeployScript,
    deploysDirectory: get(input, "deploysDirectory") ?? DEPLOYMENT_DEFAULTS.deploysDirectory,
    worldsFile: get(input, "worldsFile") ?? DEPLOYMENT_DEFAULTS.worldsFile,
  } as resolveDeploymentConfig<input>;
}

export type resolveCodegenConfig<input> = {
  readonly worldInterfaceName: "worldInterfaceName" extends keyof input
    ? input["worldInterfaceName"]
    : typeof CODEGEN_DEFAULTS.worldInterfaceName;
  readonly worldgenDirectory: "worldgenDirectory" extends keyof input
    ? input["worldgenDirectory"]
    : typeof CODEGEN_DEFAULTS.worldgenDirectory;
  readonly worldImportPath: "worldImportPath" extends keyof input
    ? input["worldImportPath"]
    : typeof CODEGEN_DEFAULTS.worldImportPath;
};

export function resolveCodegenConfig<input>(input: input): resolveCodegenConfig<input> {
  return {
    worldInterfaceName: get(input, "worldInterfaceName") ?? CODEGEN_DEFAULTS.worldInterfaceName,
    worldgenDirectory: get(input, "worldgenDirectory") ?? CODEGEN_DEFAULTS.worldgenDirectory,
    worldImportPath: get(input, "worldImportPath") ?? CODEGEN_DEFAULTS.worldImportPath,
  } as resolveCodegenConfig<input>;
}

export type resolveWorldConfig<input> = evaluate<
  resolveStoreConfig<input> & {
    readonly tables: "namespaces" extends keyof input
      ? {
          readonly [key in namespacedTableKeys<input>]: key extends `${infer namespace}__${infer table}`
            ? resolveTableConfig<
                get<get<get<get<input, "namespaces">, namespace>, "tables">, table>,
                extendedScope<input>,
                table,
                namespace
              >
            : never;
        }
      : {};
    readonly namespaces: "namespaces" extends keyof input
      ? {
          [namespaceKey in keyof input["namespaces"]]: {
            readonly tables: resolveStoreTablesConfig<
              get<input["namespaces"][namespaceKey], "tables">,
              extendedScope<input>,
              namespaceKey & string
            >;
          };
        }
      : {};
    readonly systems: "systems" extends keyof input ? input["systems"] : typeof CONFIG_DEFAULTS.systems;
    readonly excludeSystems: "excludeSystems" extends keyof input
      ? input["excludeSystems"]
      : typeof CONFIG_DEFAULTS.excludeSystems;
    readonly modules: "modules" extends keyof input ? input["modules"] : typeof CONFIG_DEFAULTS.modules;
    readonly deployment: resolveDeploymentConfig<"deployment" extends keyof input ? input["deployment"] : {}>;
    readonly codegen: resolveCodegenConfig<"codegen" extends keyof input ? input["codegen"] : {}>;
  }
>;

export function resolveWorldConfig<const input>(input: validateWorldConfig<input>): resolveWorldConfig<input> {
  const scope = extendedScope(input);
  const namespace = get(input, "namespace") ?? "";

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
          ...fullInput,
          tableId:
            fullInput.tableId ??
            resourceToHex({ type: "table", namespace: namespaceKey as string, name: tableKey as string }),
          name: fullInput.name ?? (tableKey as string),
          namespace: fullInput.namespace ?? (namespaceKey as string),
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

  const resolvedRootTables = resolveStoreTablesConfig(rootTables, scope, namespace as string);

  return {
    tables: { ...resolvedRootTables, ...resolvedNamespacedTables },
    namespaces: resolvedNamespaces,
    userTypes: get(input, "userTypes") ?? {},
    enums: get(input, "enums") ?? {},
    namespace,
    codegen: { ...resolveStoreCodegen(get(input, "codegen")), ...resolveCodegenConfig(get(input, "codegen")) },
    deployment: resolveDeploymentConfig(get(input, "deployment")),
  } as unknown as resolveWorldConfig<input>;
}
