import { expect } from "vitest";

export function createAsyncErrorHandler() {
  let errors: string[] = [];

  function reportError(error: string) {
    errors.push(error);
  }

  function resetErrors() {
    errors = [];
  }

  function expectNoAsyncErrors() {
    // This is to properly print the errors in the test console
    for (const error of errors) {
      expect(error).toEqual("");
    }
  }

  function getErrors() {
    return errors;
  }

  return { reportError, resetErrors, expectNoAsyncErrors, getErrors };
}
