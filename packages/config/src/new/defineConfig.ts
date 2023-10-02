// --- Types shared between the input and output of the config

interface PluginConfig {
  resolveConfig: <TConfigInput extends ConfigInput>(config: TConfigInput) => TConfigInput & ConfigOutput<TConfigInput>;
}

// --- Input types

interface PluginsConfigInput {
  [key: string]: PluginConfig;
}

interface ConfigInput {
  plugins: PluginsConfigInput;
}

// --- Output types

interface PluginsConfigOutput {
  [key: string]: PluginConfig;
}

interface ConfigOutput<TConfigInput extends ConfigInput> {
  plugins: TConfigInput["plugins"] & PluginsConfigOutput;
}

// --- Implementation

export function defineConfig<TConfigInput extends ConfigInput>(
  configInput: TConfigInput
): TConfigInput & ConfigOutput<TConfigInput> {
  return Object.values(configInput.plugins).reduce(
    (config, plugin) => plugin.resolveConfig(config),
    configInput
  ) as TConfigInput & ConfigOutput<TConfigInput>;
}

//--------- Testing

interface PluginsConfigInput {
  plugin1: PluginConfig;
}

interface ConfigInput {
  name: string;
}

interface PluginsConfigOutput {
  plugin2: PluginConfig;
}

interface ConfigOutput<TConfigInput extends ConfigInput> {
  name: `${TConfigInput["name"]}-resolved`;
}

const config = defineConfig({
  name: "test",
  plugins: {
    plugin1: {
      resolveConfig: (config) => ({
        ...config,
        name: `${config.name}-resolved`,
        plugins: { plugin2: { resolveConfig: (c) => c as any } },
      }),
    },
  },
});

config.name;
//      ^?

config.plugins.plugin2;
//             ^?
