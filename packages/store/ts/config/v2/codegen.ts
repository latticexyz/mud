import { CODEGEN_DEFAULTS } from "./defaults";
import { isObject, mergeIfUndefined } from "./generics";

export type resolveCodegen<codegen> = codegen extends {}
  ? mergeIfUndefined<codegen, CODEGEN_DEFAULTS>
  : CODEGEN_DEFAULTS;

export function resolveCodegen<codegen>(codegen: codegen): resolveCodegen<codegen> {
  return (
    isObject(codegen) ? mergeIfUndefined(codegen, CODEGEN_DEFAULTS) : CODEGEN_DEFAULTS
  ) as resolveCodegen<codegen>;
}
