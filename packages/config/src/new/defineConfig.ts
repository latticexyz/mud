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

// ---------

type ConfigResolver = <TConfigInput extends ConfigInput>(configInput: TConfigInput) => TConfigInput;

// ----

type PluginA = <TConfigInput extends ConfigInput>(
  configInput: TConfigInput
) => TConfigInput & { resolvedA: `${TConfigInput["name"]}-A` };

type PluginB = <TConfigInput extends ConfigInput>(
  configInput: TConfigInput
) => TConfigInput & { resolvedB: `${TConfigInput["name"]}-B` };

const config = { name: "name", tables: {} } as const satisfies ConfigInput;

const pluginA = {} as PluginA;
const pluginB = {} as PluginB;

const resolved2 = pluginA(pluginB(config));

resolved2.resolvedA;
//        ^?
