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
    expect(errors, "expect no async errors").toEqual([]);
  }

  return { reportError, resetErrors, expectNoAsyncErrors };
}
