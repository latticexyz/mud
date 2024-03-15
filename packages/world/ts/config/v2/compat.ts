import { ModuleConfig } from "./input";
import { Config, SystemsConfig } from "./output";
import { configToV1 as storeConfigToV1 } from "@latticexyz/store/config/v2";

type modulesToV1<modules extends ModuleConfig[]> = {
  [key in keyof modules]: Required<modules[key]>;
};

type systemsToV1<systems extends SystemsConfig> = {
  [key in keyof systems]: {
    name?: systems[key]["name"];
    registerFunctionSelectors: systems[key]["registerFunctionSelectors"];
  } & ({ openAccess: true } | { openAccess: false; accessList: systems[key]["accessList"] });
};

export type configToV1<config> = config extends Config
  ? storeConfigToV1<config> & {
      systems: systemsToV1<config["systems"]>;
      excludeSystems: config["excludeSystems"];
      modules: modulesToV1<config["modules"]>;
      worldContractName?: config["deployment"]["worldContractName"];
      postDeployScript: config["deployment"]["postDeployScript"];
      deploysDirectory: config["deployment"]["deploysDirectory"];
      worldsFile: config["deployment"]["worldsFile"];
      worldInterfaceName: config["codegen"]["worldInterfaceName"];
      worldgenDirectory: config["codegen"]["worldgenDirectory"];
      worldImportPath: config["codegen"]["worldImportPath"];
    }
  : never;
