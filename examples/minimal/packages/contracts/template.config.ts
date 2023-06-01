import { TemplateConfig } from "@latticexyz/store";
import mudConfig from "./mud.config";

const { tables } = mudConfig;

function templateConfig(config: TemplateConfig<typeof tables>) {
  return config;
}

export default templateConfig({
  Sample: {
    CounterTable: { value: 420 },
  },
});
