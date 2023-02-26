import chalk from "chalk";
import { ZodError } from "zod";
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

export function logError(error: Error) {
  if (error instanceof ValidationError) {
    console.log(chalk.redBright(error.message));
  } else if (error instanceof ZodError) {
    // TODO currently this error shouldn't happen, use `fromZodErrorCustom`
    const validationError = fromZodError(error, {
      prefixSeparator: "\n- ",
      issueSeparator: "\n- ",
    });
    console.log(chalk.redBright(validationError.message));
  } else if (error instanceof NotInsideProjectError) {
    console.log(chalk.red(error.message));
    console.log("");
    console.log(chalk.blue(`To learn more about MUD's configuration, please go to [TODO link to docs]`));
  } else {
    console.log(error);
  }
}
