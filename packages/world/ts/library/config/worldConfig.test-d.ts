import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { zWorldConfig } from "./worldConfig";
import { WorldUserConfig } from "./types";

describe("parseWorldConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<WorldUserConfig>().toEqualTypeOf<z.input<typeof zWorldConfig>>();
  // type equality isn't deep for optionals
  expectTypeOf<WorldUserConfig["overrideSystems"]>().toEqualTypeOf<z.input<typeof zWorldConfig>["overrideSystems"]>();
  // TODO If more nested schemas are added, provide separate tests for them
});
