export type System = {
  name: string;
  registerFunctionSelectors: boolean;
  openAccess: boolean;
  accessListAddresses: string[];
  accessListSystems: string[];
};

export type SystemsConfig = Record<string, System>;
