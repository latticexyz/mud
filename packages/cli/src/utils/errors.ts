import chalk from "chalk";
import { z, ZodError, ZodIssueCode } from "zod";
import { fromZodError, ValidationError } from "zod-validation-error";

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

export class NotESMConfigError extends Error {
  name = "NotESMConfigError";
  message = "MUD config must be an ES module";
}

export class MUDError extends Error {
  name = "MUDError";
}

export function UnrecognizedSystemErrorFactory(path: string[], systemName: string) {
  return new z.ZodError([{ code: ZodIssueCode.custom, path: path, message: `Unrecognized system: "${systemName}"` }]);
}

export function logError(error: Error) {
  if (error instanceof ValidationError) {
    console.log(chalk.redBright(error.message));
  } else if (error instanceof ZodError) {
    // TODO currently this error shouldn't happen, use `fromZodErrorCustom`
    // (see https://github.com/latticexyz/mud/issues/438)
    const validationError = fromZodError(error, {
      prefixSeparator: "\n- ",
      issueSeparator: "\n- ",
    });
    console.log(chalk.redBright(validationError.message));
  } else if (error instanceof NotInsideProjectError) {
    console.log(chalk.red(error.message));
    console.log("");
    // TODO add docs to the website and update the link to the specific page
    // (see https://github.com/latticexyz/mud/issues/445)
    console.log(chalk.blue(`To learn more about MUD's configuration, please go to https://mud.dev/packages/cli/`));
  } else if (error instanceof NotESMConfigError) {
    console.log(chalk.red(error.message));
    console.log("");
    console.log(
      chalk.blue(`Please name your config file \`mud.config.mts\`, or use \`type: "module"\` in package.json`)
    );
  } else if (error instanceof MUDError) {
    console.log(chalk.red(error));
  } else {
    console.log(error);
  }
}
