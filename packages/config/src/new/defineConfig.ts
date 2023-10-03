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

// --- Store config (to me moved to packages/store)

interface TableConfigInput {
  name: string;
}

interface TableConfigOutput {
  name: string;
}

interface TablesConfigInput {
  [key: string]: TableConfigInput;
}

interface TablesConfigOutput {
  [key: string]: TableConfigOutput;
}

interface ConfigInput {
  tables: TablesConfigInput;
}

interface ConfigOutput<TConfigInput extends ConfigInput> {
  tables: TConfigInput["tables"] & TablesConfigOutput;
}

// -- World config (to be moved to packages/world)

interface TableConfigOutput {
  namespace: string;
}

interface ConfigInput {
  namespace: string;
}

//--------- Testing

const config = defineConfig({
  namespace: "namespace",
  tables: {
    foo: {
      name: "foo",
      namespace: "subnamespace",
    },
  },
  plugins: {},
} as const);

config.tables.foo.name;
//                 ^?

config.tables.foo.namespace;
//                 ^?

config.namespace;
//     ^?
