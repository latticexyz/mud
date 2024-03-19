import { describe, it, expect, expectTypeOf } from "vitest";
import { resourceToLabel } from "./resourceToLabel";

describe("resourceToLabel", () => {
  it("creates a human-readable label for a resource", () => {
    const label = resourceToLabel({ namespace: "SomeNamespace", name: "SomeName" });
    expect(label).toBe("SomeNamespace__SomeName");
    expectTypeOf(label).toEqualTypeOf<"SomeNamespace__SomeName">();
  });

  it("creates a human-readable label for a root resource", () => {
    const label = resourceToLabel({ namespace: "", name: "SomeName" });
    expect(label).toBe("SomeName");
    expectTypeOf(label).toEqualTypeOf<"SomeName">();
  });
});
