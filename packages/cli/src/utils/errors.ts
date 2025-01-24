import chalk from "chalk";
import { ZodError } from "zod";
import { fromZodError, ValidationError } from "zod-validation-error";
import { MUDError } from "@latticexyz/common/errors";

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
  } else if (error instanceof MUDError) {
    console.log(chalk.red(error));
  } else {
    console.log(error);
  }
}
