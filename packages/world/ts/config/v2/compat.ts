import { conform, mutable } from "@arktype/util";
import { Module, World, Systems } from "./output";
import { storeToV1, Store } from "@latticexyz/store/config/v2";

type modulesToV1<modules extends readonly Module[]> = mutable<{
  [key in keyof modules]: Required<modules[key]>;
}>;

function modulesToV1<modules extends readonly Module[]>(modules: modules): modulesToV1<modules> {
  return modules.map((module) => ({
    name: module.name,
    root: module.root ?? false,
    args: module.args ?? [],
  })) as modulesToV1<modules>;
}

type systemsToV1<systems extends Systems> = {
  [key in keyof systems]: {
    name?: systems[key]["name"];
    registerFunctionSelectors: systems[key]["registerFunctionSelectors"];
  } & ({ openAccess: true } | { openAccess: false; accessList: systems[key]["accessList"] });
};

function systemsToV1<systems extends Systems>(systems: systems): systemsToV1<systems> {
  return systems;
}

export type worldToV1<world> = world extends World
  ? storeToV1<world> & {
      systems: systemsToV1<world["systems"]>;
      excludeSystems: mutable<world["excludeSystems"]>;
      modules: modulesToV1<world["modules"]>;
      worldContractName: world["deployment"]["customWorldContract"];
      postDeployScript: world["deployment"]["postDeployScript"];
      deploysDirectory: world["deployment"]["deploysDirectory"];
      worldsFile: world["deployment"]["worldsFile"];
      worldInterfaceName: world["codegen"]["worldInterfaceName"];
      worldgenDirectory: world["codegen"]["worldgenDirectory"];
      worldImportPath: world["codegen"]["worldImportPath"];
    }
  : never;

export function worldToV1<world>(world: conform<world, World>): worldToV1<world> {
  const v1WorldConfig = {
    systems: systemsToV1(world.systems),
    excludeSystems: world.excludeSystems,
    modules: modulesToV1(world.modules),
    worldContractName: world.deployment.customWorldContract,
    postDeployScript: world.deployment.postDeployScript,
    deploysDirectory: world.deployment.deploysDirectory,
    worldsFile: world.deployment.worldsFile,
    worldInterfaceName: world.codegen.worldInterfaceName,
    worldgenDirectory: world.codegen.worldgenDirectory,
    worldImportPath: world.codegen.worldImportPath,
  };

  return { ...storeToV1(world as Store), ...v1WorldConfig } as worldToV1<world>;
}
