import { extendMUDCoreConfig } from "@latticexyz/config";
import { zPluginWorldConfig } from "../../library";

extendMUDCoreConfig((config) => {
  const modifiedConfig = { ...config } as Record<string, unknown>;

  const worldConfig = zPluginWorldConfig.parse(config);

  modifiedConfig.modules = [
    ...worldConfig.modules,
    {
      name: "FactoryModule",
      root: true,
      args: [],
    },
  ];

  return modifiedConfig;
});
