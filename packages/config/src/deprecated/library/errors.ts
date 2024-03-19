import { z, ZodError, ZodIssueCode } from "zod";
import { fromZodError } from "zod-validation-error";

/** @deprecated */
export class MUDContextAlreadyCreatedError extends Error {
  name = "MUDContextAlreadyCreatedError";
  message = "MUD context was already created";
}

/** @deprecated */
export class MUDContextNotCreatedError extends Error {
  name = "MUDContextNotCreatedError";
  message = "MUD context has not been created";
}

/**
 * Wrapper with preset styles, only requires a `prefix`
 * @deprecated
 */
export function fromZodErrorCustom(error: ZodError, prefix: string) {
  return fromZodError(error, {
    prefix: prefix,
    prefixSeparator: "\n- ",
    issueSeparator: "\n- ",
  });
}

/** @deprecated */
export class NotInsideProjectError extends Error {
  name = "NotInsideProjectError";
  message = "You are not inside a MUD project";
}

/** @deprecated */
export function UnrecognizedSystemErrorFactory(path: string[], systemName: string) {
  return new z.ZodError([{ code: ZodIssueCode.custom, path: path, message: `Unrecognized system: "${systemName}"` }]);
}
