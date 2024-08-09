import { describe, expect, it } from "vitest";
import { type } from "arktype";
import fs from "node:fs/promises";
import { bytecode, parseArtifact } from "./types";

describe("types", () => {
  describe("hex", () => {
    it("should validate a bytecode string", () => {
      expect(bytecode("0x")).toBe("0x");
      expect(bytecode("0x0")).toBe("0x0");
      expect(bytecode("0x1234")).toBe("0x1234");
      expect(bytecode("0xabcd")).toBe("0xabcd");
      expect(bytecode("invalid")).toBeInstanceOf(type.errors);
      expect(bytecode("0xabcd__$placeholder$__")).toBe("0xabcd__$placeholder$__");
    });
  });

  describe("artifact", async () => {
    const artifactJson = await fs.readFile(`${__dirname}/../../out/World.sol/World.json`, "utf-8");

    it("can parse json to artifact", () => {
      const parsedArtifact = parseArtifact(artifactJson);

      if (parsedArtifact instanceof type.errors) {
        return parsedArtifact.throw();
      }

      expect(parsedArtifact.bytecode.object).toMatch(/^0x/);
      expect(parsedArtifact.bytecode.linkReferences).toEqual({});

      expect(parsedArtifact.deployedBytecode.object).toMatch(/^0x/);
      expect(parsedArtifact.deployedBytecode.linkReferences).toEqual({});

      expect(parsedArtifact.abi).toBeInstanceOf(Array);
    });
  });
});
