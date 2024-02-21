import { StoreConfigInput } from "@latticexyz/store";

export interface WorldConfigInput {
  namespaces: WorldNamespacesConfigInput;
}

export interface WorldNamespacesConfigInput {
  [key: string]: WorldNamespaceConfigInput;
}

export interface WorldNamespaceConfigInput {
  name: string;
}

export type WorldConfigOutput<configInput extends WorldConfigInput> = {
  resolved: WorldResolvedConfigOutput<configInput>;
  tables: WorldResolvedTablesOutput<configInput>;
};

export type WorldResolvedTablesOutput<configInput extends WorldConfigInput> = {
  [key in keyof configInput["namespaces"]]: { name: `namespacetable-${configInput["namespaces"][key]["name"]}` };
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WorldResolvedConfigOutput<configInput extends WorldConfigInput> {
  world: "test";
}

export type withWorldConfig<configInput extends WorldConfigInput> = configInput &
  StoreConfigInput &
  WorldConfigOutput<configInput>;

export const withWorldConfig = <configInput extends WorldConfigInput>(
  configInput: configInput
): withWorldConfig<configInput> => {
  return {} as withWorldConfig<configInput>;
};

const a = withWorldConfig({ namespaces: {} });
