// Inspired by https://doc.rust-lang.org/std/result/
export type Result<Ok, Err = unknown> = { ok: Ok } | { error: Err };

export function isOk<Ok, Err>(result: Result<Ok, Err>): result is { ok: Ok } {
  return "ok" in result;
}

export function isError<Ok, Err>(result: Result<Ok, Err>): result is { error: Err } {
  return "error" in result;
}
