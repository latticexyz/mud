import path from "node:path";
import { describe, expect, it } from "vitest";

describe("getUserTypes", () => {
  it("should resolve relative import path", () => {
    const rootDir = process.cwd();
    const filePath = "./src/MyUserType.sol";
    const tableFilename = "src/codegen/tables/Table.sol";

    const importPath = path.relative(path.dirname(path.join(rootDir, tableFilename)), path.join(rootDir, filePath));

    expect(importPath).toMatchInlineSnapshot('"../../MyUserType.sol"');
  });
});
