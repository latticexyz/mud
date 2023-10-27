import { describe, expect, expectTypeOf, it } from "vitest";
import { mapObject } from "./mapObject";
import { assertExhaustive } from "./assertExhaustive";

describe("mapObject", () => {
  it("should map the source to the target", () => {
    const source = {
      hello: "world",
      foo: "bar",
    } as const;

    type Mapped<T extends Record<string, string>> = { [key in keyof T]: `mapped-${T[key]}` };

    const target = mapObject<typeof source, Mapped<typeof source>>(source, (value, key) => {
      if (key === "hello") return `mapped-${value}`;
      if (key === "foo") return `mapped-${value}`;
      assertExhaustive(key);
    });

    expect(target).toEqual({ hello: `mapped-world`, foo: `mapped-bar` });
    expectTypeOf<typeof target>().toEqualTypeOf<Mapped<typeof source>>();
  });
});
