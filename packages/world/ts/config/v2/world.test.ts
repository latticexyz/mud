import { describe, it } from "vitest";
import { resolveWorldConfig } from "./world";
import { attest } from "@arktype/attest";

describe("resolveWorldConfig", () => {
  it("should resolve namespaced tables", () => {
    const config = resolveWorldConfig({
      namespaces: {
        ExampleNamespace: {
          tables: {
            ExampleTable: {
              schema: {
                key: "address",
                value: "uint256",
                dynamic: "string",
              },
              primaryKey: ["key"],
            },
          },
        },
      },
    });

    const expected = {
      tables: {
        ExampleNamespace__ExampleTable: {
          schema: {
            key: {
              type: "address",
              internalType: "address",
            },
            value: {
              type: "uint256",
              internalType: "uint256",
            },
            dynamic: {
              type: "string",
              internalType: "string",
            },
          },
          keySchema: {
            key: {
              type: "address",
              internalType: "address",
            },
          },
          valueSchema: {
            value: {
              type: "uint256",
              internalType: "uint256",
            },
            dynamic: {
              type: "string",
              internalType: "string",
            },
          },
          primaryKey: ["key"],
        },
      },
      namespaces: {
        ExampleNamespace: {
          tables: {
            ExampleTable: {
              schema: {
                key: {
                  type: "address",
                  internalType: "address",
                },
                value: {
                  type: "uint256",
                  internalType: "uint256",
                },
                dynamic: {
                  type: "string",
                  internalType: "string",
                },
              },
              keySchema: {
                key: {
                  type: "address",
                  internalType: "address",
                },
              },
              valueSchema: {
                value: {
                  type: "uint256",
                  internalType: "uint256",
                },
                dynamic: {
                  type: "string",
                  internalType: "string",
                },
              },
              primaryKey: ["key"],
            },
          },
        },
      },
      userTypes: {},
      enums: {},
      namespace: "",
    } as const;

    attest<typeof expected>(config);
  });

  it("should resolve namespaced table config with user types and enums", () => {
    const config = resolveWorldConfig({
      namespaces: {
        ExampleNamespace: {
          tables: {
            ExampleTable: {
              schema: {
                key: "Static",
                value: "MyEnum",
                dynamic: "Dynamic",
              },
              primaryKey: ["key"],
            },
          },
        },
      },
      userTypes: {
        Static: "address",
        Dynamic: "string",
      },
      enums: {
        MyEnum: ["First", "Second"],
      },
    });

    const expected = {
      tables: {
        ExampleNamespace__ExampleTable: {
          schema: {
            key: {
              type: "address",
              internalType: "Static",
            },
            value: {
              type: "uint8",
              internalType: "MyEnum",
            },
            dynamic: {
              type: "string",
              internalType: "Dynamic",
            },
          },
          keySchema: {
            key: {
              type: "address",
              internalType: "Static",
            },
          },
          valueSchema: {
            value: {
              type: "uint8",
              internalType: "MyEnum",
            },
            dynamic: {
              type: "string",
              internalType: "Dynamic",
            },
          },
          primaryKey: ["key"],
        },
      },
      namespaces: {
        ExampleNamespace: {
          tables: {
            ExampleTable: {
              schema: {
                key: {
                  type: "address",
                  internalType: "Static",
                },
                value: {
                  type: "uint8",
                  internalType: "MyEnum",
                },
                dynamic: {
                  type: "string",
                  internalType: "Dynamic",
                },
              },
              keySchema: {
                key: {
                  type: "address",
                  internalType: "Static",
                },
              },
              valueSchema: {
                value: {
                  type: "uint8",
                  internalType: "MyEnum",
                },
                dynamic: {
                  type: "string",
                  internalType: "Dynamic",
                },
              },
              primaryKey: ["key"],
            },
          },
        },
      },
      userTypes: {
        Static: "address",
        Dynamic: "string",
      },
      enums: {
        MyEnum: ["First", "Second"],
      },
      namespace: "",
    } as const;

    attest<typeof expected>(config);
  });

  describe("should have the same output as `resolveWorldConfig` for store config inputs", () => {
    it("should accept a shorthand store config as input and expand it", () => {
      const config = resolveWorldConfig({ tables: { Name: "address" } });
      const expected = {
        tables: {
          Name: {
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
            primaryKey: ["key"],
          },
        },
        userTypes: {},
        enums: {},
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof config>(expected);
    });

    it("it should accept a user type as input and expand it", () => {
      const config = resolveWorldConfig({ tables: { Name: "CustomType" }, userTypes: { CustomType: "address" } });
      const expected = {
        tables: {
          Name: {
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
            primaryKey: ["key"],
          },
        },
        userTypes: { CustomType: "address" },
        enums: {},
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof expected>(config);
    });

    it("given a schema with a key field with static ABI type, it should use `key` as single key", () => {
      const config = resolveWorldConfig({ tables: { Example: { key: "address", name: "string", age: "uint256" } } });
      const expected = {
        tables: {
          Example: {
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
            primaryKey: ["key"],
          },
        },
        userTypes: {},
        enums: {},
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof expected>(config);
    });

    it("given a schema with a key field with static custom type, it should use `key` as single key", () => {
      const config = resolveWorldConfig({ tables: { Example: { key: "address", name: "string", age: "uint256" } } });
      const expected = {
        tables: {
          Example: {
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
            primaryKey: ["key"],
          },
        },
        userTypes: {},
        enums: {},
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof expected>(config);
    });

    it("throw an error if the shorthand doesn't include a key field", () => {
      attest(
        resolveWorldConfig({
          tables: {
            // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit primaryKey override.
            Example: {
              name: "string",
              age: "uint256",
            },
          },
        }),
      ).type.errors("Provide a `key` field with static ABI type or a full config with explicit primaryKey override.");
    });

    it("throw an error if the shorthand config includes a non-static key field", () => {
      attest(
        // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit primaryKey override.
        resolveWorldConfig({ tables: { Example: { key: "string", name: "string", age: "uint256" } } }),
      ).type.errors("Provide a `key` field with static ABI type or a full config with explicit primaryKey override.");
    });

    it("throw an error if the shorthand config includes a non-static user type as key field", () => {
      attest(
        resolveWorldConfig({
          // @ts-expect-error Provide a `key` field with static ABI type or a full config with explicit primaryKey override.
          tables: { Example: { key: "dynamic", name: "string", age: "uint256" } },
          userTypes: { dynamic: "string", static: "address" },
        }),
      ).type.errors("Provide a `key` field with static ABI type or a full config with explicit primaryKey override.");
    });

    it("should return the full config given a full config with one key", () => {
      const config = resolveWorldConfig({
        tables: {
          Example: {
            schema: { key: "address", name: "string", age: "uint256" },
            primaryKey: ["age"],
          },
        },
      });
      const expected = {
        tables: {
          Example: {
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
              age: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            valueSchema: {
              key: {
                type: "address",
                internalType: "address",
              },
              name: {
                type: "string",
                internalType: "string",
              },
            },
            primaryKey: ["age"],
          },
        },
        userTypes: {},
        enums: {},
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof expected>(config);
    });

    it("should return the full config given a full config with one key and user types", () => {
      const config = resolveWorldConfig({
        tables: {
          Example: {
            schema: { key: "dynamic", name: "string", age: "static" },
            primaryKey: ["age"],
          },
        },
        userTypes: { static: "address", dynamic: "string" },
      });
      const expected = {
        tables: {
          Example: {
            schema: {
              key: {
                type: "string",
                internalType: "dynamic",
              },
              name: {
                type: "string",
                internalType: "string",
              },
              age: {
                type: "address",
                internalType: "static",
              },
            },
            keySchema: {
              age: {
                type: "address",
                internalType: "static",
              },
            },
            valueSchema: {
              key: {
                type: "string",
                internalType: "dynamic",
              },
              name: {
                type: "string",
                internalType: "string",
              },
            },
            primaryKey: ["age"],
          },
        },
        userTypes: { static: "address", dynamic: "string" },
        enums: {},
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof expected>(config);
    });

    it("it should return the full config given a full config with two primaryKey", () => {
      const config = resolveWorldConfig({
        tables: {
          Example: {
            schema: { key: "address", name: "string", age: "uint256" },
            primaryKey: ["age", "key"],
          },
        },
      });
      const expected = {
        tables: {
          Example: {
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
              age: {
                type: "uint256",
                internalType: "uint256",
              },
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
            },
            primaryKey: ["age", "key"],
          },
        },
        userTypes: {},
        enums: {},
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof expected>(config);
    });

    it("should resolve two tables in the config with different schemas", () => {
      const config = resolveWorldConfig({
        tables: {
          First: {
            schema: { firstKey: "address", firstName: "string", firstAge: "uint256" },
            primaryKey: ["firstKey", "firstAge"],
          },
          Second: {
            schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
            primaryKey: ["secondKey", "secondAge"],
          },
        },
      });
      const expected = {
        tables: {
          First: {
            schema: {
              firstKey: {
                type: "address",
                internalType: "address",
              },
              firstName: {
                type: "string",
                internalType: "string",
              },
              firstAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            keySchema: {
              firstKey: {
                type: "address",
                internalType: "address",
              },
              firstAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            valueSchema: {
              firstName: {
                type: "string",
                internalType: "string",
              },
            },
            primaryKey: ["firstKey", "firstAge"],
          },
          Second: {
            schema: {
              secondKey: {
                type: "address",
                internalType: "address",
              },
              secondName: {
                type: "string",
                internalType: "string",
              },
              secondAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            keySchema: {
              secondKey: {
                type: "address",
                internalType: "address",
              },
              secondAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            valueSchema: {
              secondName: {
                type: "string",
                internalType: "string",
              },
            },
            primaryKey: ["secondKey", "secondAge"],
          },
        },
        userTypes: {},
        enums: {},
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof expected>(config);
    });

    it("should resolve two tables in the config with different schemas and user types", () => {
      const config = resolveWorldConfig({
        tables: {
          First: {
            schema: { firstKey: "Static", firstName: "Dynamic", firstAge: "uint256" },
            primaryKey: ["firstKey", "firstAge"],
          },
          Second: {
            schema: { secondKey: "Static", secondName: "Dynamic", secondAge: "uint256" },
            primaryKey: ["secondKey", "secondAge"],
          },
        },
        userTypes: { Static: "address", Dynamic: "string" },
      });
      const expected = {
        tables: {
          First: {
            schema: {
              firstKey: {
                type: "address",
                internalType: "Static",
              },
              firstName: {
                type: "string",
                internalType: "Dynamic",
              },
              firstAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            keySchema: {
              firstKey: {
                type: "address",
                internalType: "Static",
              },
              firstAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            valueSchema: {
              firstName: {
                type: "string",
                internalType: "Dynamic",
              },
            },
            primaryKey: ["firstKey", "firstAge"],
          },
          Second: {
            schema: {
              secondKey: {
                type: "address",
                internalType: "Static",
              },
              secondName: {
                type: "string",
                internalType: "Dynamic",
              },
              secondAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            keySchema: {
              secondKey: {
                type: "address",
                internalType: "Static",
              },
              secondAge: {
                type: "uint256",
                internalType: "uint256",
              },
            },
            valueSchema: {
              secondName: {
                type: "string",
                internalType: "Dynamic",
              },
            },
            primaryKey: ["secondKey", "secondAge"],
          },
        },
        userTypes: { Static: "address", Dynamic: "string" },
        enums: {},
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof expected>(config);
    });

    it("should throw if referring to fields of different tables", () => {
      attest(
        resolveWorldConfig({
          tables: {
            First: {
              schema: { firstKey: "address", firstName: "string", firstAge: "uint256" },
              primaryKey: ["firstKey", "firstAge"],
            },
            Second: {
              schema: { secondKey: "address", secondName: "string", secondAge: "uint256" },
              // @ts-expect-error Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'
              primaryKey: ["firstKey", "secondAge"],
            },
          },
        }),
      ).type.errors(`Type '"firstKey"' is not assignable to type '"secondKey" | "secondAge"'`);
    });

    it("should throw an error if the provided key is not a static field", () => {
      attest(
        resolveWorldConfig({
          tables: {
            Example: {
              schema: { key: "address", name: "string", age: "uint256" },
              // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'.
              primaryKey: ["name"],
            },
          },
        }),
      ).type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
    });

    it("should throw an error if the provided key is not a static field with user types", () => {
      attest(
        resolveWorldConfig({
          tables: {
            Example: {
              schema: { key: "address", name: "Dynamic", age: "uint256" },
              // @ts-expect-error Type '"name"' is not assignable to type '"key" | "age"'.
              primaryKey: ["name"],
            },
          },
          userTypes: {
            Dynamic: "string",
          },
        }),
      ).type.errors(`Type '"name"' is not assignable to type '"key" | "age"'`);
    });

    it("should return the full config given a full config with enums and user types", () => {
      const config = resolveWorldConfig({
        tables: {
          Example: {
            schema: { key: "dynamic", name: "ValidNames", age: "static" },
            primaryKey: ["name"],
          },
        },
        userTypes: { static: "address", dynamic: "string" },
        enums: {
          ValidNames: ["first", "second"],
        },
      });
      const expected = {
        tables: {
          Example: {
            schema: {
              key: {
                type: "string",
                internalType: "dynamic",
              },
              name: {
                type: "uint8",
                internalType: "ValidNames",
              },
              age: {
                type: "address",
                internalType: "static",
              },
            },
            keySchema: {
              name: {
                type: "uint8",
                internalType: "ValidNames",
              },
            },
            valueSchema: {
              age: {
                type: "address",
                internalType: "static",
              },
              key: {
                type: "string",
                internalType: "dynamic",
              },
            },
            primaryKey: ["name"],
          },
        },
        userTypes: { static: "address", dynamic: "string" },
        enums: {
          ValidNames: ["first", "second"],
        },
        namespace: "",
        namespaces: {},
      } as const;

      attest<typeof expected>(config);
    });

    it("should use the root namespace as default namespace", () => {
      const config = resolveWorldConfig({ tables: { Example: {} } });

      attest<"">(config.namespace);
    });
  });
});
