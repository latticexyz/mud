import { conform, mutable } from "@arktype/util";
import { ModuleConfig } from "./input";
import { Config, SystemsConfig } from "./output";
import { configToV1 as storeConfigToV1, Config as StoreConfig } from "@latticexyz/store/config/v2";

type modulesToV1<modules extends readonly ModuleConfig[]> = mutable<{
  [key in keyof modules]: Required<modules[key]>;
}>;

function modulesToV1<modules extends readonly ModuleConfig[]>(modules: modules): modulesToV1<modules> {
  return modules.map((module) => ({
    name: module.name,
    root: module.root ?? false,
    args: module.args ?? [],
  })) as modulesToV1<modules>;
}

type systemsToV1<systems extends SystemsConfig> = {
  [key in keyof systems]: {
    name?: systems[key]["name"];
    registerFunctionSelectors: systems[key]["registerFunctionSelectors"];
  } & ({ openAccess: true } | { openAccess: false; accessList: systems[key]["accessList"] });
};

function systemsToV1<systems extends SystemsConfig>(systems: systems): systemsToV1<systems> {
  return systems;
}

export type configToV1<config> = config extends Config
  ? storeConfigToV1<config> & {
      systems: systemsToV1<config["systems"]>;
      excludeSystems: mutable<config["excludeSystems"]>;
      modules: modulesToV1<config["modules"]>;
      worldContractName: config["deployment"]["customWorldContract"];
      postDeployScript: config["deployment"]["postDeployScript"];
      deploysDirectory: config["deployment"]["deploysDirectory"];
      worldsFile: config["deployment"]["worldsFile"];
      worldInterfaceName: config["codegen"]["worldInterfaceName"];
      worldgenDirectory: config["codegen"]["worldgenDirectory"];
      worldImportPath: config["codegen"]["worldImportPath"];
    }
  : never;

export function configToV1<config>(config: conform<config, Config>): configToV1<config> {
  const v1WorldConfig = {
    systems: systemsToV1(config.systems),
    excludeSystems: config.excludeSystems,
    modules: modulesToV1(config.modules),
    worldContractName: config.deployment.customWorldContract,
    postDeployScript: config.deployment.postDeployScript,
    deploysDirectory: config.deployment.deploysDirectory,
    worldsFile: config.deployment.worldsFile,
    worldInterfaceName: config.codegen.worldInterfaceName,
    worldgenDirectory: config.codegen.worldgenDirectory,
    worldImportPath: config.codegen.worldImportPath,
  };

  return { ...storeConfigToV1(config as StoreConfig), ...v1WorldConfig } as configToV1<config>;
}
