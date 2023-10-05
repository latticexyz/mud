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
type First<TArr extends unknown[]> = TArr extends [infer First, ...infer Remaining] ? First : never;

type CombinedOutput<TConfigInput extends ConfigInput, TPlugins extends unknown[]> = TPlugins extends never[]
  ? TConfigInput
  : TPlugins extends [infer First, ...infer Remaining]
  ? 1
  : // ? FirstPlugin extends MudPlugin<TConfigInput>
    // ? CombinedOutput<TConfigInput & ExtractOutput<FirstPlugin>, RemainingPlugins>
    // : 1
    TPlugins;

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

function defineConfig<TConfigInput extends ConfigInput, TPlugins extends MudPlugin<TConfigInput>[]>(
  configInput: TConfigInput,
  plugins: TPlugins
): CombinedOutput<TConfigInput, TPlugins> {
  return {} as CombinedOutput<TConfigInput, TPlugins>;
}

const plugins = [new PluginA(config), new PluginB(config)];

const resolved = defineConfig(config, plugins);

type TFirst = First<typeof plugins>;

resolved;
// ^?
