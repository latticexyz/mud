import { expect } from "vitest";

/**
 * When a test initiates a background process which encounters an error,
 * the test does not necessarily fail. Instead, vitest just prints a warning
 * about an unhandled exception. This util allows background processes to
 * report errors (via `reportError`) and allows tests to explicitly fail
 * if there were errors in background processes (via `expectNoAsyncErrors`).
 */
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
