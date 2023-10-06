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
  tables: {
    pluginATable: "pluginA";
  };
  resolvedA: `${TConfigInput["name"]}-A`;
  resolvedTables: {
    [key in keyof TConfigInput["tables"] &
      string as `resolved${Capitalize<key>}`]: `${TConfigInput["tables"][key]}-resolved`;
  };
};

const PluginA = (<TConfigInput extends ConfigInput>(
  configInput: TConfigInput
): TConfigInput & PluginAOutput<TConfigInput> => {
  return {
    ...configInput,
    tables: { ...configInput.tables, pluginATable: "pluginA" },
    resolvedA: `${configInput.name}-A`,
    resolvedTables: {} as any, // TODO: actually resolve the values as specified in the type
  };
}) satisfies ConfigResolver;

type PluginBOutput<TConfigInput extends ConfigInput> = {
  tables: {
    pluginBTable: "pluginB";
  };
  resolvedB: `${TConfigInput["name"]}-B`;
};

const PluginB = (<TConfigInput extends ConfigInput>(
  configInput: TConfigInput
): PluginBOutput<TConfigInput> & TConfigInput => {
  return {
    ...configInput,
    tables: { ...configInput.tables, pluginBTable: "pluginB" },
    resolvedB: `${configInput.name}-B`,
  };
}) satisfies ConfigResolver;

const resolved = PluginA(PluginB({ name: "name", tables: { table1: "user-table" } } as const));

resolved.resolvedA;
//        ^?

resolved.resolvedB;
//       ^?

resolved.tables.table1;
//              ^?

resolved.tables.pluginATable;
//              ^?

resolved.tables.pluginBTable;
//              ^?

resolved.resolvedTables.resolvedPluginBTable;
//                      ^?

resolved.resolvedTables.resolvedTable1;
//                      ^?
