import { CODEGEN_DEFAULTS } from "./defaults";
import { get } from "./generics";
import { Codegen } from "./output";

export type resolveCodegen<codegen> = {
  [key in keyof Codegen]: key extends keyof codegen ? codegen[key] : (typeof CODEGEN_DEFAULTS)[key];
};

export function resolveCodegen<codegen>(codegen: codegen): resolveCodegen<codegen> {
  return Object.fromEntries(
    Object.entries(CODEGEN_DEFAULTS).map(([key, defaultValue]) => [key, get(codegen, key) ?? defaultValue]),
  ) as resolveCodegen<codegen>;
}
