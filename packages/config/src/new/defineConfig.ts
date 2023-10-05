// Helper types (might be able to use some of these from type-fest or sth)
// type First<TArray extends readonly unknown[]> = TArray extends readonly [infer T, ...unknown[]] ? T : never;
// type Tail<TArray extends readonly unknown[]> = TArray extends readonly [unknown, ...infer T] ? T : never;

interface ConfigInput {
  name: string;
}

interface MudPlugin<TConfigInput extends ConfigInput> {
  input: unknown;
  output: unknown;
}

interface IPluginA<TConfigInput extends ConfigInput> extends MudPlugin<TConfigInput> {
  input: TConfigInput;
  output: TConfigInput & { resolvedA: `${TConfigInput["name"]}-A` };
}

interface IPluginB<TConfigInput extends ConfigInput> extends MudPlugin<TConfigInput> {
  input: TConfigInput;
  output: TConfigInput & { resolvedB: `${TConfigInput["name"]}-B` };
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

class PluginA<TConfigInput extends ConfigInput> implements IPluginA<TConfigInput> {
  input: TConfigInput;
  output: IPluginA<TConfigInput>["output"];

  constructor(config: TConfigInput) {
    this.input = config;
    this.output = { ...config, resolvedA: `${config.name}-A` };
  }
}

class PluginB<TConfigInput extends ConfigInput> implements IPluginB<TConfigInput> {
  input: TConfigInput;
  output: IPluginB<TConfigInput>["output"];

  constructor(config: TConfigInput) {
    this.input = config;
    this.output = { ...config, resolvedB: `${config.name}-B` };
  }
}

const config = { name: "hello" } as const satisfies ConfigInput;

function defineConfig<TConfigInput extends ConfigInput, TPlugins extends readonly MudPlugin<TConfigInput>[]>(
  configInput: TConfigInput,
  plugins: TPlugins
): CombinedOutput<TConfigInput, TPlugins> {
  return {} as CombinedOutput<TConfigInput, TPlugins>;
}

const resolved = defineConfig(config, [new PluginA(config), new PluginB(config)] as const);

resolved.name;
//        ^?

resolved.resolvedA;
//        ^?

resolved.resolvedB;
//        ^?
