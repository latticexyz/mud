interface ConfigType {
  CounterTable?: { value: number };
  MessageTable?: { value: string };
}

export interface TemplateConfig {
  templates: Record<string, ConfigType>;
}

export function templateConfig(config: TemplateConfig) {
  return config;
}

export default templateConfig({
  templates: {
    Sample: {
      CounterTable: { value: 420 },
    },
  },
});
