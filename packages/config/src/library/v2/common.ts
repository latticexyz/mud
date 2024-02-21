// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MudConfigInput {
  /** This interface can be extended by MUD config plugins */
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars
export interface MudResolvedConfigOutput<configInput extends MudConfigInput = MudConfigInput> {
  /** This interface can be extended by MUD config plugins */
}

export interface MudConfigOutput<configInput extends MudConfigInput = MudConfigInput> {
  resolved: MudResolvedConfigOutput<configInput>;
}

export type resolveConfig<configInput extends MudConfigInput> = configInput & MudConfigOutput<configInput>;

export const resolveConfig = <configInput extends MudConfigInput>(
  configInput: configInput
): resolveConfig<configInput> => {
  return {} as resolveConfig<configInput>;
};
