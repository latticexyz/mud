import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { WorldConfig, WorldUserConfig } from "./loadWorldConfig.js";

describe("loadWorldConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<WorldUserConfig>().toEqualTypeOf<z.input<typeof WorldConfig>>();
  // type equality isn't deep for optionals
  expectTypeOf<WorldUserConfig["overrideSystems"]>().toEqualTypeOf<z.input<typeof WorldConfig>["overrideSystems"]>();
  // TODO If more nested schemas are added, provide separate tests for them
});
