/**
 * Requirements:
 * - Plugins can extend the input config type
 * - The output of the resolved config should be the combination of all plugin resolver's outputs
 */

interface TableConfigInput {
  name: string;
}

interface TablesConfigInput {
  [key: string]: Readonly<TableConfigInput>;
}

interface ConfigInput {
  name: string;
  tables: TablesConfigInput;
}

// Attempt at combining resolve functions
type ConfigResolver<TConfigInput extends ConfigInput, TConfigOutput> = (configInput: TConfigInput) => TConfigOutput;

type ConfigOutput<
  TConfigInput extends ConfigInput,
  TConfigResolvers extends unknown[]
> = TConfigResolvers extends never[]
  ? TConfigInput // If there are no more resolvers left, return the input type
  : TConfigResolvers extends [infer FirstConfigResolver, ...infer RemainingConfigResolvers]
  ? // If there is at least one resolver left, infer the first output and recursively combine with the rest
    FirstConfigResolver extends ConfigResolver<TConfigInput, infer TConfigOutput>
    ? ConfigOutput<TConfigInput & TConfigOutput, RemainingConfigResolvers>
    : never
  : never;

type ConfigOutputExplicit<TConfigInput extends ConfigInput> = ConfigOutput<
  TConfigInput,
  [typeof resolveA, typeof resolveB]
>;

// Attempt at combining output types
type CombinedOutputs<
  TConfigInput extends ConfigInput,
  TConfigOutputs extends unknown[]
> = TConfigOutputs extends never[]
  ? TConfigInput
  : TConfigOutputs extends [infer FirstConfigOutput, ...infer RemainingConfigOutputs]
  ? CombinedOutputs<TConfigInput & FirstConfigOutput, RemainingConfigOutputs>
  : never;

type CombinedOutputsWrapper<TConfigInput extends ConfigInput> = CombinedOutputs<
  TConfigInput,
  [ConfigOutputA<TConfigInput>, ConfigOutputB<TConfigInput>]
>;

// define generic plugin type

// ----------- Plugin A

type ConfigOutputA<TConfigInput extends ConfigInput = ConfigInput> = TConfigInput & {
  resolvedA: `${TConfigInput["name"]}-A`;
};

function resolveA<TConfigInput extends ConfigInput>(configInput: TConfigInput): ConfigOutputA<TConfigInput> {
  return { ...configInput, resolvedA: `${configInput.name}-A` };
}

// ----------- Plugin B

type ConfigOutputB<TConfigInput extends ConfigInput = ConfigInput> = TConfigInput & {
  resolvedB: `${TConfigInput["name"]}-B`;
};

function resolveB<TConfigInput extends ConfigInput>(configInput: TConfigInput): ConfigOutputB<TConfigInput> {
  return { ...configInput, resolvedB: `${configInput.name}-B` };
}

// --------- Usage tests

const config = { name: "hello", tables: { table1: { name: "table1" } } } as const satisfies ConfigInput;

////////// Merge by combining objects

const outputA = {} as ConfigOutputA<typeof config>;
const outputB = {} as ConfigOutputB<typeof config>;
const combinedOutput = {} as CombinedOutputsWrapper<typeof config>;

combinedOutput.name;
//             ^?
combinedOutput.resolvedA;
//             ^?
combinedOutput.resolvedB;
//             ^?

////////// Merge by combining resolve function
const inferredCombinedOutput = {} as ConfigOutput<
  typeof config,
  [typeof resolveA<typeof config>, typeof resolveB<typeof config>]
>;

inferredCombinedOutput.name;
//                     ^?
inferredCombinedOutput.resolvedA;
//                     ^?
inferredCombinedOutput.resolvedB;
//                     ^?
inferredCombinedOutput.tables.table1.name;
//                                   ^?

const configOutputA = resolveA(config);
configOutputA.name;
//            ^?
configOutputA.resolvedA;
//            ^?
configOutputA.tables.table1.name;
//                          ^?

const configOutputB = resolveB(config);
configOutputB.name;
//            ^?
configOutputB.resolvedB;
//            ^?
configOutputB.tables.table1.name;
//                          ^?

const configOutputAB = resolveB(resolveA(config));
configOutputAB.name;
//             ^?
configOutputAB.resolvedA;
//             ^?
configOutputAB.resolvedB;
//             ^?
configOutputAB.tables.table1.name;
//                           ^?

const configOutputBA = resolveA(resolveB(config));
configOutputBA.name;
//             ^?
configOutputBA.resolvedA;
//             ^?
configOutputBA.resolvedB;
//             ^?
configOutputBA.tables.table1.name;
//                           ^?
