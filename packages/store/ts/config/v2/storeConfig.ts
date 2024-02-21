import { MudConfigInput as BaseMudConfigInput, resolveConfig } from "@latticexyz/config";

export interface MudConfigInput extends BaseMudConfigInput {
  namespaces: StoreNamespacesConfigInput;
}

export interface StoreNamespacesConfigInput {
  [key: string]: StoreNamespaceConfigInput;
}

export interface StoreNamespaceConfigInput {
  name: string;
}

export const storeConfig = <configInput extends MudConfigInput>(
  configInput: configInput
): resolveConfig<configInput> => {
  return {} as resolveConfig<configInput>;
};

const a = storeConfig({ namespaces: { hello: { name: "hello" } } });
