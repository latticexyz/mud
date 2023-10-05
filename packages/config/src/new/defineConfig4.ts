interface ConfigInputX {
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ConfigOutputX<TConfigInput extends ConfigInputX> {}

interface ConfigOutputXA<TConfigInput extends ConfigInputX> extends ConfigOutputX<TConfigInput> {
  resolvedA: `${TConfigInput["name"]}-A`;
}

interface ConfigOutputXB<TConfigInput extends ConfigInputX> extends ConfigOutputX<TConfigInput> {
  resolvedB: `${TConfigInput["name"]}-B`;
}

type CombinedOutputsX<
  TConfigInput extends ConfigInputX,
  TConfigOutputs extends ConfigOutputX<TConfigInput>[]
> = TConfigOutputs extends never[]
  ? TConfigInput
  : TConfigOutputs extends [infer FirstConfigOutput, ...infer RemainingConfigOutputs]
  ? RemainingConfigOutputs extends ConfigOutputX<TConfigInput>[]
    ? CombinedOutputsX<TConfigInput & FirstConfigOutput, RemainingConfigOutputs>
    : never
  : never;

const configX = { name: "hello", tables: { table1: { name: "table1" } } } as const satisfies ConfigInput;

type AppliedOutput = CombinedOutputsX<typeof configX, [ConfigOutputXA<typeof configX>, ConfigOutputXB<typeof configX>]>;
//    ^?
