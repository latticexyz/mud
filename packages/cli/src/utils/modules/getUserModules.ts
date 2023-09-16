import { Module } from "./types";

export function getUserModules(defaultModules: { name: string }[], configModules: Module[]): Omit<Module, "address">[] {
  return configModules.filter((module) => !defaultModules.some((m) => m.name === module.name));
}
