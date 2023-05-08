import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { zWorldConfig } from "./zod";
import { WorldConfig } from "./types";

describe("worldConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<WorldConfig>().toEqualTypeOf<z.input<typeof zWorldConfig>>();
  // type equality isn't deep for optionals
  expectTypeOf<WorldConfig["overrideSystems"]>().toEqualTypeOf<z.input<typeof zWorldConfig>["overrideSystems"]>();
  // TODO If more nested schemas are added, provide separate tests for them
});
