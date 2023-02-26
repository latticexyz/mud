import chalk from "chalk";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export class NotInsideProjectError extends Error {
  name = "NotInsideProjectError";
  message = "You are not inside a MUD project";
}

export function logError(error: Error) {
  if (error instanceof ZodError) {
    const validationError = fromZodError(error, {
      prefix: chalk.red("Config Validation Error"),
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
