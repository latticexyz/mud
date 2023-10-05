// Helper types (might be able to use some of these from type-fest or sth)
// type First<TArray extends readonly unknown[]> = TArray extends readonly [infer T, ...unknown[]] ? T : never;
// type Tail<TArray extends readonly unknown[]> = TArray extends readonly [unknown, ...infer T] ? T : never;

interface TablesConfig {
  [key: string]: string;
}

interface ConfigInput {
  name: string;
  tables: TablesConfig;
}

interface MudPlugin<TConfigInput extends ConfigInput> {
  input: unknown;
  output: unknown;
}

type ExtractOutput<TMudPlugin extends MudPlugin<ConfigInput>> = TMudPlugin["output"];

type CombinedOutput<
  TConfigInput extends ConfigInput,
  TPlugins extends readonly unknown[]
> = TPlugins extends readonly never[]
  ? TConfigInput
  : TPlugins extends readonly [infer First, ...infer Tail]
  ? First extends MudPlugin<TConfigInput>
    ? CombinedOutput<TConfigInput & ExtractOutput<First>, Tail>
    : never
  : never;

class PluginA<TConfigInput extends ConfigInput> {
  input: TConfigInput;
  output: TConfigInput & { resolvedA: `${TConfigInput["name"]}-A` } & { resolvedTables: TConfigInput["tables"] };

  constructor(config: TConfigInput) {
    this.input = config;
    this.output = { ...config, resolvedA: `${config.name}-A`, resolvedTables: config.tables };
  }
}

class PluginB<TConfigInput extends ConfigInput> {
  input: TConfigInput;
  output: TConfigInput & { resolvedB: `${TConfigInput["name"]}-B` } & {
    tables: TConfigInput["tables"] & { pluginBTable: "test" };
  };

  constructor(config: TConfigInput) {
    this.input = config;
    this.output = { ...config, resolvedB: `${config.name}-B`, tables: { ...config.tables, pluginBTable: "test" } };
  }
}

const config = { name: "hello", tables: { configTable: "configTable" } } as const satisfies ConfigInput;

function defineConfig<TConfigInput extends ConfigInput, TPlugins extends readonly MudPlugin<TConfigInput>[]>(
  configInput: TConfigInput,
  plugins: TPlugins
): CombinedOutput<TConfigInput, TPlugins> {
  return {} as CombinedOutput<TConfigInput, TPlugins>;
}

const resolved = defineConfig(config, [new PluginA(new PluginB(config).output), new PluginB(config)] as const);

resolved.name;
//        ^?
resolved.resolvedA;
//        ^?
resolved.resolvedB;
//        ^?
resolved.tables.configTable;
//              ^?
resolved.tables.pluginBTable;
//              ^?
resolved.resolvedTables;
//       ^?
