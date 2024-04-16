import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import { schemaAbiTypes } from "./schemaAbiTypes";

describe("schemaAbiTypes", () => {
  it("should be in sync with SchemaType.sol", async () => {
    const source = await fs.readFile(`${__dirname}/../solidity/SchemaType.sol`, "utf8");
    const matches = source.match(/enum SchemaType \{([\s\S]+?)\}/);
    const soliditySchemaTypes = matches?.[1].replace(/\s/g, "").split(",") ?? [];

    const soliditySchemaTypesAsAbiTypes = soliditySchemaTypes.map((soliditySchemaType) =>
      soliditySchemaType.replace(/_ARRAY$/, "[]").toLowerCase(),
    );

    expect(soliditySchemaTypesAsAbiTypes).toStrictEqual(schemaAbiTypes);
  });
});
