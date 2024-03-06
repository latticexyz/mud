import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { ValidKeys, inferSchema, resolveTableConfig, resolveTableShorthandConfig } from "./table";
import { AbiTypeScope, extendScope } from "./scope";

describe("ValidKeys", () => {
  it("should return a tuple of valid keys", () => {
    attest<"static"[], ValidKeys<{ static: "uint256"; dynamic: "string" }, AbiTypeScope>>();
  });

  it("should return a tuple of valid keys with an extended scope", () => {
    const scope = extendScope(AbiTypeScope, { static: "address", dynamic: "string" });
    attest<
      ("static" | "customStatic")[],
      ValidKeys<
        { static: "uint256"; dynamic: "string"; customStatic: "static"; customDynamic: "dynamic" },
        typeof scope
      >
    >();
  });
});

describe.only("resolveTableShorthandConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableShorthandConfig("address");
    attest<{
      schema: {
        key: "bytes32";
        value: "address";
      };
      keys: ["key"];
    }>(table).type.toString.snap('{ schema: { key: "bytes32"; value: "address"; }; keys: ["key"]; }');
  });

  it.only("should expand a single custom into a key/value schema", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableShorthandConfig("CustomType", scope);
    attest<{
      schema: {
        key: "bytes32";
        value: "CustomType";
      };
      keys: ["key"];
    }>(table).type.toString.snap('{ schema: { key: "bytes32"; value: "CustomType"; }; keys: ["key"]; }');
  });

  it("should throw if the provided shorthand is not an ABI type and no user types are provided", () => {
    // @ts-expect-error Argument of type '"NotAnAbiType"' is not assignable to parameter of type AbiType'
    attest(resolveTableShorthandConfig("NotAnAbiType")).type.errors(
      `Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'.`
    );
  });

  it("should throw if the provided shorthand is not a user type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    // @ts-expect-error Argument of type '"NotACustomType"' is not assignable to parameter of type AbiType | "CustomType"
    attest(resolveTableShorthandConfig("NotACustomType", scope)).type.errors(
      `Argument of type '"NotACustomType"' is not assignable to parameter of type 'AbiType | "CustomType"'.`
    );
  });

  it.only("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableShorthandConfig({ key: "address", name: "string", age: "uint256" });
    attest<{
      schema: {
        key: "address";
        name: "string";
        age: "uint256";
      };
      keys: ["key"];
    }>(table).type.toString.snap('{ schema: { key: "address"; name: "string"; age: "uint256"; }; keys: ["key"]; }');
  });

  it("should throw an error if the shorthand doesn't include a key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveTableShorthandConfig({ name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override."
    );
  });

  it("should throw an error if the shorthand config includes a non-static key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveTableShorthandConfig({ key: "string", name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override."
    );
  });

  it("should throw an error if an invalid type is passed in", () => {
    // @ts-expect-error Type '"NotACustomType"' is not assignable to type 'AbiType'.
    attest(resolveTableShorthandConfig({ key: "uint256", name: "NotACustomType" })).type.errors(
      `Type '"NotACustomType"' is not assignable to type 'AbiType'.`
    );
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableShorthandConfig({ key: "CustomType", name: "string", age: "uint256" }, scope);
    attest<{
      schema: { key: "CustomType"; name: "string"; age: "uint256" };
      keys: ["key"];
    }>(table).type.toString.snap('{ schema: { key: "CustomType"; name: "string"; age: "uint256"; }; keys: ["key"]; }');
  });

  it("should throw an error if `key` is not a custom static type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "bytes" });
    // @ts-expect-error "Error: Provide a `key` field with static ABI type or a full config with explicit keys override."
    attest(resolveTableShorthandConfig({ key: "CustomType", name: "string", age: "uint256" }, scope)).type.errors(
      `Provide a \`key\` field with static ABI type or a full config with explicit keys override.`
    );
  });
});

describe("inferSchema", () => {
  it("should infer the schema of a single ABI type shorthand table config", () => {
    attest<inferSchema<"address">>({ key: "bytes32", value: "address" } as const);
  });

  it("should infer the schema of a single ABI type shorthand table config with custom types", () => {
    attest<inferSchema<"CustomType", { CustomType: "string" }>>({ key: "bytes32", value: "CustomType" } as const);
  });

  it("should infer the schema of a schema shorthand table config", () => {
    attest<inferSchema<{ key: "bytes32"; value: "address" }>>({ key: "bytes32", value: "address" } as const);
  });

  it("should infer the schema of a schema shorthand table config with custom types", () => {
    attest<inferSchema<{ key: "bytes32"; value: "CustomType" }, { CustomType: "string" }>>({
      key: "bytes32",
      value: "CustomType",
    } as const);
  });

  it("should infer the schema of a full table config", () => {
    attest<inferSchema<{ schema: { key: "bytes32"; value: "address" }; keys: ["key"] }>>({
      key: "bytes32",
      value: "address",
    } as const);
  });

  it("should infer the schema of a full table config with custom types", () => {
    attest<inferSchema<{ schema: { key: "bytes32"; value: "CustomType" }; keys: ["key"] }, { CustomType: "string" }>>({
      key: "bytes32",
      value: "CustomType",
    } as const);
  });

  it("test", () => {
    attest<
      inferSchema<
        {
          schema: { key: "CustomType"; name: "string"; age: "uint256" };
          keys: ["key"];
        },
        { CustomType: "string" }
      >
    >({ key: "CustomType", name: "string", age: "uint256" } as const);
  });

  describe("resolveTableConfig", () => {
    it("should expand a single ABI type into a key/value schema", () => {
      const table = resolveTableConfig("address");
      const expected = {
        schema: {
          key: {
            type: "bytes32",
            internalType: "bytes32",
          },
          value: {
            type: "address",
            internalType: "address",
          },
        },
        keySchema: {
          key: {
            type: "bytes32",
            internalType: "bytes32",
          },
        },
        valueSchema: {
          value: {
            type: "address",
            internalType: "address",
          },
        },
        keys: ["key"],
      } as const;
      attest<typeof expected>(table).equals(expected);
    });

    it("should expand a single custom type into a key/value schema", () => {
      const table = resolveTableConfig("CustomType", { CustomType: "address" });
      const expected = {
        schema: {
          key: {
            type: "bytes32",
            internalType: "bytes32",
          },
          value: {
            type: "address",
            internalType: "CustomType",
          },
        },
        keySchema: {
          key: {
            type: "bytes32",
            internalType: "bytes32",
          },
        },
        valueSchema: {
          value: {
            type: "address",
            internalType: "CustomType",
          },
        },
        keys: ["key"],
      } as const;
      attest<typeof expected>(table).equals(expected);
    });

    it("should use `key` as single key if it has a static ABI type", () => {
      const table = resolveTableConfig({ key: "address", name: "string", age: "uint256" });
      const expected = {
        schema: {
          key: {
            type: "address",
            internalType: "address",
          },
          name: {
            type: "string",
            internalType: "string",
          },
          age: {
            type: "uint256",
            internalType: "uint256",
          },
        },
        keySchema: {
          key: {
            type: "address",
            internalType: "address",
          },
        },
        valueSchema: {
          name: {
            type: "string",
            internalType: "string",
          },
          age: {
            type: "uint256",
            internalType: "uint256",
          },
        },
        keys: ["key"],
      } as const;
      attest<typeof expected>(table).equals(expected);
    });

    it("should use `key` as single key if it has a static custom type", () => {
      const table = resolveTableConfig(
        { key: "CustomType", name: "string", age: "uint256" },
        { CustomType: "uint256" }
      );
      const expected = {
        schema: {
          key: {
            type: "uint256",
            internalType: "CustomType",
          },
          name: {
            type: "string",
            internalType: "string",
          },
          age: {
            type: "uint256",
            internalType: "uint256",
          },
        },
        keySchema: {
          key: {
            type: "uint256",
            internalType: "CustomType",
          },
        },
        valueSchema: {
          name: {
            type: "string",
            internalType: "string",
          },
          age: {
            type: "uint256",
            internalType: "uint256",
          },
        },
        keys: ["key"],
      } as const;
      attest<typeof expected>(table).equals(expected);
    });

    it("should throw if the shorthand key is a dynamic ABI type", () => {
      // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
      attest(resolveTableConfig({ key: "string", name: "string", age: "uint256" })).type.errors(
        "Provide a `key` field with static ABI type or a full config with explicit keys override"
      );
    });

    it("should throw if the shorthand key is a dyamic custom type", () => {
      // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
      attest(resolveTableConfig({ key: "CustomType" }, { CustomType: "string" })).type.errors(
        "Provide a `key` field with static ABI type or a full config with explicit keys override."
      );
    });

    it("should throw if the shorthand key is neither a custom nor ABI type", () => {
      // @ts-expect-error Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'TableConfigInput
      attest(resolveTableConfig("NotAnAbiType")).type.errors(
        `Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'TableConfigInput`
      );
    });

    it("should throw if the shorthand doesn't include a key field", () => {
      // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
      attest(resolveTableConfig({ name: "string", age: "uint256" })).type.errors(
        "Provide a `key` field with static ABI type or a full config with explicit keys override."
      );
    });

    it("should return the full config given a full config with one key", () => {
      const table = resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        keys: ["age"],
      });
      const expected = {
        schema: {
          key: { type: "address", internalType: "address" },
          name: { type: "string", internalType: "string" },
          age: { type: "uint256", internalType: "uint256" },
        },
        keySchema: {
          age: { type: "uint256", internalType: "uint256" },
        },
        valueSchema: {
          key: { type: "address", internalType: "address" },
          name: { type: "string", internalType: "string" },
        },
        keys: ["age"],
      } as const;
      attest<typeof expected>(table).equals(expected);
    });

    it("should return the full config given a full config with two keys", () => {
      const table = resolveTableConfig({
        schema: { key: "address", name: "string", age: "uint256" },
        keys: ["age", "key"],
      });
      const expected = {
        schema: {
          key: { type: "address", internalType: "address" },
          name: { type: "string", internalType: "string" },
          age: { type: "uint256", internalType: "uint256" },
        },
        keySchema: {
          age: { type: "uint256", internalType: "uint256" },
          key: { type: "address", internalType: "address" },
        },
        valueSchema: {
          name: { type: "string", internalType: "string" },
        },
        keys: ["age", "key"],
      } as const;
      attest<typeof expected>(table).equals(expected);
    });

    it("should return the full config given a config with custom types as values", () => {
      const table = resolveTableConfig(
        { key: "address", name: "CustomString", age: "CustomNumber" },
        { CustomString: "string", CustomNumber: "uint256" }
      );
      const expected = {
        schema: {
          key: {
            type: "address",
            internalType: "address",
          },
          name: {
            type: "string",
            internalType: "CustomString",
          },
          age: {
            type: "uint256",
            internalType: "CustomNumber",
          },
        },
        keySchema: {
          key: {
            type: "address",
            internalType: "address",
          },
        },
        valueSchema: {
          name: {
            type: "string",
            internalType: "CustomString",
          },
          age: {
            type: "uint256",
            internalType: "CustomNumber",
          },
        },
        keys: ["key"],
      } as const;
      attest<typeof expected>(table).equals(expected);
    });

    it("should return the full config given a config with custom type as key", () => {
      const table = resolveTableConfig(
        { key: "CustomNumber", name: "CustomString", age: "CustomNumber" },
        { CustomString: "string", CustomNumber: "uint256" }
      );
      const expected = {
        schema: {
          key: {
            type: "uint256",
            internalType: "CustomNumber",
          },
          name: {
            type: "string",
            internalType: "CustomString",
          },
          age: {
            type: "uint256",
            internalType: "CustomNumber",
          },
        },
        keySchema: {
          key: {
            type: "uint256",
            internalType: "CustomNumber",
          },
        },
        valueSchema: {
          name: {
            type: "string",
            internalType: "CustomString",
          },
          age: {
            type: "uint256",
            internalType: "CustomNumber",
          },
        },
        keys: ["key"],
      } as const;
      attest<typeof expected>(table).equals(expected);
    });

    it("should throw if the provided key is a dynamic ABI type", () => {
      attest(
        resolveTableConfig({
          schema: { key: "address", name: "string", age: "uint256" },
          // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'
          keys: ["name"],
        })
      ).type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
    });

    it("should throw if the provided key is a dynamic ABI type if user types are provided", () => {
      attest(
        resolveTableConfig(
          {
            schema: { key: "address", name: "string", age: "uint256" },
            // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'
            keys: ["name"],
          },
          { CustomType: "string" }
        )
      ).type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
    });

    it("should throw if the provided key is a dynamic custom type", () => {
      attest(
        resolveTableConfig(
          {
            schema: { key: "CustomType", name: "string", age: "uint256" },
            // @ts-expect-error Type '"key"' is not assignable to type '"age"'
            keys: ["key"],
          },
          { CustomType: "string" }
        )
      ).type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
    });

    it("should throw if the provided key is neither a custom nor ABI type", () => {
      attest(
        resolveTableConfig(
          {
            schema: { key: "address", name: "string", age: "uint256" },
            // @ts-expect-error Type '"NotAKey"' is not assignable to type '"key" | "age"'
            keys: ["NotAKey"],
          },
          { CustomType: "string" }
        )
      ).type.errors(`Type '"NotAKey"' is not assignable to type '"key" | "age"'`);
    });
  });
});
