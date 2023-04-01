import chalk from "chalk";
import { ZodError } from "zod";
import { fromZodError, ValidationError } from "zod-validation-error";
import { NotInsideProjectError, MUDError } from "@latticexyz/config";

export class CommandFailedError extends Error {
  name = "CommandFailed";
}

export function logError(error: unknown) {
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
  } else if (error instanceof MUDError) {
    console.log(chalk.red(error));
  } else {
    console.log(error);
  }
}
