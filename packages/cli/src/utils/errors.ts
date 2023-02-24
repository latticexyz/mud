// Based on hardhat's errors and errors-list (MIT)
// https://github.com/NomicFoundation/hardhat/tree/main/packages/hardhat-core

export interface ErrorDescriptor {
  message: (...args: string[]) => string;
  description: string;
}

export class CustomError extends Error {
  constructor(message: string, public readonly parent?: Error) {
    super(message);

    this.name = this.constructor.name;
  }
}

export class MUDError extends CustomError {
  public static isMUDError(other: any): other is MUDError {
    return other !== undefined && other !== null && other._isMUDError === true;
  }

  public readonly errorDescriptor: ErrorDescriptor;

  private readonly _isMUDError: boolean;

  constructor(errorDescriptor: ErrorDescriptor, messageArguments: string[] = [], parentError?: Error) {
    super(errorDescriptor.message(...messageArguments), parentError);

    this.errorDescriptor = errorDescriptor;

    this._isMUDError = true;
  }
}

export const ERRORS: { [key: string]: ErrorDescriptor } = {
  //  on how to add the config file
  NOT_INSIDE_PROJECT: {
    message: () => `You are not inside a MUD project.`,
    description: `You are trying to run MUD outside of a MUD project.
    
To learn more about MUD's configuration, please go to [TODO link to docs]`,
  },

  INVALID_CONFIG: {
    message: (...errors: string[]) => `There's one or more errors in your config file:

  ${errors.join("\n  ")}

To learn more about MUD's configuration, please go to [TODO link to docs]`,
    description: `You have one or more errors in your config file.

Check the error message for details, or [TODO link to docs]`,
  },
};
