import { Module, ModuleConfig } from "./types";

export async function updateModuleAddresses(input: {
  moduleContracts: Record<string, Promise<string>>;
  modules: Omit<Module, "address">[];
}): Promise<ModuleConfig> {
  const { modules, moduleContracts } = input;
  const test: ModuleConfig = [];
  for (const module of modules) {
    const moduleAddress = await moduleContracts[module.name];
    if (!moduleAddress) throw new Error(`Module ${module.name} not found`);
    test.push({
      ...module,
      address: moduleAddress,
    });
  }
  return test;
}
