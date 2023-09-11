import { Module } from "./types";

export function getUserModules(
  defaultModules: { name: string }[],
  configModules: Omit<Module, "address">[]
): Omit<Module, "address">[] {
  return configModules.filter((module) => !defaultModules.some((m) => m.name === module.name));
}
