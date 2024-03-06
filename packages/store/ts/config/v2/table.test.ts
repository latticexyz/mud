import { describe, it } from "vitest";
import { attest } from "@arktype/attest";
import { ValidKeys, resolveTableConfig, resolveTableShorthand } from "./table";
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

describe("resolveTableShorthand", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableShorthand("address");
    attest<{
      schema: {
        key: "bytes32";
        value: "address";
      };
      keys: ["key"];
    }>(table).type.toString.snap('{ schema: { key: "bytes32"; value: "address"; }; keys: ["key"]; }');
  });

  it("should expand a single custom into a key/value schema", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableShorthand("CustomType", scope);
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
    attest(resolveTableShorthand("NotAnAbiType")).type.errors(
      `Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'.`
    );
  });

  it("should throw if the provided shorthand is not a user type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    // @ts-expect-error Argument of type '"NotACustomType"' is not assignable to parameter of type AbiType | "CustomType"
    attest(resolveTableShorthand("NotACustomType", scope)).type.errors(
      `Argument of type '"NotACustomType"' is not assignable to parameter of type 'AbiType | "CustomType"'.`
    );
  });

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableShorthand({ key: "address", name: "string", age: "uint256" });
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
    attest(resolveTableShorthand({ name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override."
    );
  });

  it("should throw an error if the shorthand config includes a non-static key field", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveTableShorthand({ key: "string", name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override."
    );
  });

  it("should throw an error if an invalid type is passed in", () => {
    // @ts-expect-error Type '"NotACustomType"' is not assignable to type 'AbiType'.
    attest(resolveTableShorthand({ key: "uint256", name: "NotACustomType" })).type.errors(
      `Type '"NotACustomType"' is not assignable to type 'AbiType'.`
    );
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableShorthand({ key: "CustomType", name: "string", age: "uint256" }, scope);
    attest<{
      schema: { key: "CustomType"; name: "string"; age: "uint256" };
      keys: ["key"];
    }>(table).type.toString.snap('{ schema: { key: "CustomType"; name: "string"; age: "uint256"; }; keys: ["key"]; }');
  });

  it("should throw an error if `key` is not a custom static type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "bytes" });
    // @ts-expect-error "Error: Provide a `key` field with static ABI type or a full config with explicit keys override."
    attest(resolveTableShorthand({ key: "CustomType", name: "string", age: "uint256" }, scope)).type.errors(
      `Provide a \`key\` field with static ABI type or a full config with explicit keys override.`
    );
  });
});

// describe("inferSchema", () => {
//   it("should infer the schema of a single ABI type shorthand table config", () => {
//     attest<inferSchema<"address">, { key: "bytes32"; value: "address" }>();
//   });

//   it("should infer the schema of a single ABI type shorthand table config with custom types", () => {
//     const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
//     attest<inferSchema<"CustomType", typeof scope>, { key: "bytes32"; value: "CustomType" }>();
//   });

//   it("should infer the schema of a schema shorthand table config", () => {
//     attest<inferSchema<{ key: "bytes32"; value: "address" }>, { key: "bytes32"; value: "address" }>();
//   });

//   it("should infer the schema of a full table config", () => {
//     attest<
//       inferSchema<{ schema: { key: "bytes32"; value: "address" }; keys: ["key"] }>,
//       {
//         key: "bytes32";
//         value: "address";
//       }
//     >();
//   });

//   it("should infer the schema of a full table config with custom types", () => {
//     attest<inferSchema<{ schema: { key: "bytes32"; value: "CustomType" }; keys: ["key"] }, { CustomType: "string" }>>({
//       key: "bytes32",
//       value: "CustomType",
//     } as const);
//   });

//   it("test", () => {
//     attest<
//       inferSchema<
//         {
//           schema: { key: "CustomType"; name: "string"; age: "uint256" };
//           keys: ["key"];
//         },
//         { CustomType: "string" }
//       >
//     >({ key: "CustomType", name: "string", age: "uint256" } as const);
//   });
// });

describe("resolveTableConfig", () => {
  it("should expand a single ABI type into a key/value schema", () => {
    const table = resolveTableConfig("address");
    attest<{
      schema: {
        key: {
          type: "bytes32";
          internalType: "bytes32";
        };
        value: {
          type: "address";
          internalType: "address";
        };
      };
      keySchema: {
        key: {
          type: "bytes32";
          internalType: "bytes32";
        };
      };
      valueSchema: {
        value: {
          type: "address";
          internalType: "address";
        };
      };
      keys: ["key"];
    }>(table);
  });

  it("should expand a single custom type into a key/value schema", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "address" });
    const table = resolveTableConfig("CustomType", scope);
    attest<{
      schema: {
        key: {
          type: "bytes32";
          internalType: "bytes32";
        };
        value: {
          type: "address";
          internalType: "CustomType";
        };
      };
      keySchema: {
        key: {
          type: "bytes32";
          internalType: "bytes32";
        };
      };
      valueSchema: {
        value: {
          type: "address";
          internalType: "CustomType";
        };
      };
      keys: ["key"];
    }>(table);
  });

  it("should use `key` as single key if it has a static ABI type", () => {
    const table = resolveTableConfig({ key: "address", name: "string", age: "uint256" });
    attest<{
      schema: {
        key: {
          type: "address";
          internalType: "address";
        };
        name: {
          type: "string";
          internalType: "string";
        };
        age: {
          type: "uint256";
          internalType: "uint256";
        };
      };
      keySchema: {
        key: {
          type: "address";
          internalType: "address";
        };
      };
      valueSchema: {
        name: {
          type: "string";
          internalType: "string";
        };
        age: {
          type: "uint256";
          internalType: "uint256";
        };
      };
      keys: ["key"];
    }>(table);
  });

  it("should use `key` as single key if it has a static custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "uint256" });
    const table = resolveTableConfig({ key: "CustomType", name: "string", age: "uint256" }, scope);
    attest<{
      schema: {
        key: {
          type: "uint256";
          internalType: "CustomType";
        };
        name: {
          type: "string";
          internalType: "string";
        };
        age: {
          type: "uint256";
          internalType: "uint256";
        };
      };
      keySchema: {
        key: {
          type: "uint256";
          internalType: "CustomType";
        };
      };
      valueSchema: {
        name: {
          type: "string";
          internalType: "string";
        };
        age: {
          type: "uint256";
          internalType: "uint256";
        };
      };
      keys: ["key"];
    }>(table);
  });

  it("should throw if the shorthand key is a dynamic ABI type", () => {
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveTableConfig({ key: "string", name: "string", age: "uint256" })).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override"
    );
  });

  it("should throw if the shorthand key is a dyamic custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "bytes" });
    // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit keys override.
    attest(resolveTableConfig({ key: "CustomType" }, scope)).type.errors(
      "Provide a `key` field with static ABI type or a full config with explicit keys override."
    );
  });

  it("should throw if the shorthand key is neither a custom nor ABI type", () => {
    // @ts-expect-error Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'
    attest(resolveTableConfig("NotAnAbiType")).type.errors(
      `Argument of type '"NotAnAbiType"' is not assignable to parameter of type 'AbiType'`
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
    attest<{
      schema: {
        key: { type: "address"; internalType: "address" };
        name: { type: "string"; internalType: "string" };
        age: { type: "uint256"; internalType: "uint256" };
      };
      keySchema: {
        age: { type: "uint256"; internalType: "uint256" };
      };
      valueSchema: {
        key: { type: "address"; internalType: "address" };
        name: { type: "string"; internalType: "string" };
      };
      keys: "age"[];
    }>(table);
  });

  it("should return the full config given a full config with two keys", () => {
    const table = resolveTableConfig({
      schema: { key: "address", name: "string", age: "uint256" },
      keys: ["age", "key"],
    });
    attest<{
      schema: {
        key: { type: "address"; internalType: "address" };
        name: { type: "string"; internalType: "string" };
        age: { type: "uint256"; internalType: "uint256" };
      };
      keySchema: {
        age: { type: "uint256"; internalType: "uint256" };
        key: { type: "address"; internalType: "address" };
      };
      valueSchema: {
        name: { type: "string"; internalType: "string" };
      };
      // TODO: how can we return a tuple here instead of an unordered array?
      keys: ("age" | "key")[];
    }>(table);
  });

  it("should return the full config given a config with custom types as values", () => {
    const scope = extendScope(AbiTypeScope, { CustomString: "string", CustomNumber: "uint256" });
    const table = resolveTableConfig({ key: "address", name: "CustomString", age: "CustomNumber" }, scope);
    attest<{
      schema: {
        key: {
          type: "address";
          internalType: "address";
        };
        name: {
          type: "string";
          internalType: "CustomString";
        };
        age: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      keySchema: {
        key: {
          type: "address";
          internalType: "address";
        };
      };
      valueSchema: {
        name: {
          type: "string";
          internalType: "CustomString";
        };
        age: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      keys: ["key"];
    }>(table);
  });

  it("should return the full config given a config with custom type as key", () => {
    const scope = extendScope(AbiTypeScope, { CustomString: "string", CustomNumber: "uint256" });
    const table = resolveTableConfig({ key: "CustomNumber", name: "CustomString", age: "CustomNumber" }, scope);
    attest<{
      schema: {
        key: {
          type: "uint256";
          internalType: "CustomNumber";
        };
        name: {
          type: "string";
          internalType: "CustomString";
        };
        age: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      keySchema: {
        key: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      valueSchema: {
        name: {
          type: "string";
          internalType: "CustomString";
        };
        age: {
          type: "uint256";
          internalType: "CustomNumber";
        };
      };
      keys: ["key"];
    }>(table);
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
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(
      resolveTableConfig(
        {
          schema: { key: "address", name: "string", age: "uint256" },
          // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'
          keys: ["name"],
        },
        scope
      )
    ).type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
  });

  it("should throw if the provided key is a dynamic custom type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(
      resolveTableConfig(
        {
          schema: { key: "CustomType", name: "string", age: "uint256" },
          // @ts-expect-error Type '"key"' is not assignable to type '"age"'
          keys: ["key"],
        },
        scope
      )
    ).type.errors(`Type '"name"' is not assignable to type '"age"'`);
  });

  it("should throw if the provided key is neither a custom nor ABI type", () => {
    const scope = extendScope(AbiTypeScope, { CustomType: "string" });
    attest(
      resolveTableConfig(
        {
          schema: { key: "address", name: "string", age: "uint256" },
          // @ts-expect-error Type '"NotAKey"' is not assignable to type '"key" | "age"'
          keys: ["NotAKey"],
        },
        scope
      )
    ).type.errors(`Type '"NotAKey"' is not assignable to type '"key" | "age"'`);
  });
});
