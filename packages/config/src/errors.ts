import chalk from "chalk";
import { z, ZodError, ZodIssueCode } from "zod";
import { fromZodError } from "zod-validation-error";

export class MUDError extends Error {
  name = "MUDError";
}

// Wrapper with preset styles, only requires a `prefix`
export function fromZodErrorCustom(error: ZodError, prefix: string) {
  return fromZodError(error, {
    prefix: chalk.red(prefix),
    prefixSeparator: "\n- ",
    issueSeparator: "\n- ",
  });
}

export class NotInsideProjectError extends Error {
  name = "NotInsideProjectError";
  message = "You are not inside a MUD project";
}

export function UnrecognizedSystemErrorFactory(path: string[], systemName: string) {
  return new z.ZodError([{ code: ZodIssueCode.custom, path: path, message: `Unrecognized system: "${systemName}"` }]);
}
