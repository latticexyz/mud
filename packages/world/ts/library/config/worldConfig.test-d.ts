import { describe, expectTypeOf } from "vitest";
import { z } from "zod";
import { zWorldConfig } from "./worldConfig";
import { WorldUserConfig } from "./types";

describe("worldConfig", () => {
  // Typecheck manual interfaces against zod
  expectTypeOf<WorldUserConfig>().toEqualTypeOf<z.input<typeof zWorldConfig>>();
  // type equality isn't deep for optionals
  expectTypeOf<WorldUserConfig["systems"]>().toEqualTypeOf<z.input<typeof zWorldConfig>["systems"]>();
  // TODO If more nested schemas are added, provide separate tests for them
});
