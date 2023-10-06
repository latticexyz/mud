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

type PluginAOutput<TConfigInput extends ConfigInput> = {
  resolvedA: `${TConfigInput["name"]}-A`;
};

const PluginA = (<TConfigInput extends ConfigInput>(
  configInput: TConfigInput
): TConfigInput & PluginAOutput<TConfigInput> => {
  return { ...configInput, resolvedA: `${configInput.name}-A` };
}) satisfies ConfigResolver;

type PluginBOutput<TConfigInput extends ConfigInput> = {
  resolvedB: `${TConfigInput["name"]}-B`;
};

const PluginB = (<TConfigInput extends ConfigInput>(
  configInput: TConfigInput
): PluginBOutput<TConfigInput> & TConfigInput => {
  return { ...configInput, resolvedB: `${configInput.name}-B` };
}) satisfies ConfigResolver;

const config = { name: "name", tables: {} } as const satisfies ConfigInput;

const resolved = PluginA(PluginB(config));

resolved.resolvedA;
//        ^?

resolved.resolvedB;
//       ^?
