import { describe, expect, it } from "vitest";
import { renderImportPath } from "./renderImportPath";

describe("renderImportPath", () => {
  it("returns valid path for package imports", () => {
    expect(renderImportPath("@latticexyz/store/src")).toMatchInlineSnapshot('"@latticexyz/store/src"');
    expect(renderImportPath("@latticexyz/store/src/")).toMatchInlineSnapshot('"@latticexyz/store/src"');
    expect(renderImportPath("@latticexyz/store/src", "IStore.sol")).toMatchInlineSnapshot(
      '"@latticexyz/store/src/IStore.sol"',
    );
    expect(renderImportPath("@latticexyz/store/src/", "IStore.sol")).toMatchInlineSnapshot(
      '"@latticexyz/store/src/IStore.sol"',
    );
    expect(renderImportPath("@latticexyz/store/src", "codegen/tables/Tables.sol")).toMatchInlineSnapshot(
      '"@latticexyz/store/src/codegen/tables/Tables.sol"',
    );
    expect(renderImportPath("@latticexyz/store/src/", "codegen/tables/Tables.sol")).toMatchInlineSnapshot(
      '"@latticexyz/store/src/codegen/tables/Tables.sol"',
    );
    expect(renderImportPath("@latticexyz/store/src", "./codegen/tables/Tables.sol")).toMatchInlineSnapshot(
      '"@latticexyz/store/src/codegen/tables/Tables.sol"',
    );
    expect(renderImportPath("@latticexyz/store/src/", "./codegen/tables/Tables.sol")).toMatchInlineSnapshot(
      '"@latticexyz/store/src/codegen/tables/Tables.sol"',
    );
    expect(renderImportPath("@latticexyz/store/src", "../test/codegen/common.sol")).toMatchInlineSnapshot(
      '"@latticexyz/store/test/codegen/common.sol"',
    );
    expect(renderImportPath("@latticexyz/store/src/", "../test/codegen/common.sol")).toMatchInlineSnapshot(
      '"@latticexyz/store/test/codegen/common.sol"',
    );
  });

  it("returns valid path for relative imports", () => {
    expect(renderImportPath(".")).toMatchInlineSnapshot('"."');
    expect(renderImportPath("./")).toMatchInlineSnapshot('"."');
    expect(renderImportPath(".", "IStore.sol")).toMatchInlineSnapshot('"./IStore.sol"');
    expect(renderImportPath("./", "IStore.sol")).toMatchInlineSnapshot('"./IStore.sol"');
    expect(renderImportPath("./src")).toMatchInlineSnapshot('"./src"');
    expect(renderImportPath("./src/")).toMatchInlineSnapshot('"./src"');
    expect(renderImportPath("./src", "IStore.sol")).toMatchInlineSnapshot('"./src/IStore.sol"');
    expect(renderImportPath("../test/", "IStore.sol")).toMatchInlineSnapshot('"../test/IStore.sol"');
    expect(renderImportPath("../test")).toMatchInlineSnapshot('"../test"');
    expect(renderImportPath("../test/")).toMatchInlineSnapshot('"../test"');
    expect(renderImportPath("../test", "IStore.sol")).toMatchInlineSnapshot('"../test/IStore.sol"');
    expect(renderImportPath("../test/", "IStore.sol")).toMatchInlineSnapshot('"../test/IStore.sol"');
    expect(renderImportPath(".", "codegen/tables/Tables.sol")).toMatchInlineSnapshot('"./codegen/tables/Tables.sol"');
    expect(renderImportPath("./", "codegen/tables/Tables.sol")).toMatchInlineSnapshot('"./codegen/tables/Tables.sol"');
    expect(renderImportPath(".", "./codegen/tables/Tables.sol")).toMatchInlineSnapshot('"./codegen/tables/Tables.sol"');
    expect(renderImportPath("./", "./codegen/tables/Tables.sol")).toMatchInlineSnapshot(
      '"./codegen/tables/Tables.sol"',
    );
    expect(renderImportPath(".", "../test/codegen/common.sol")).toMatchInlineSnapshot('"../test/codegen/common.sol"');
    expect(renderImportPath("./", "../test/codegen/common.sol")).toMatchInlineSnapshot('"../test/codegen/common.sol"');
    expect(renderImportPath("./src", "codegen/tables/Tables.sol")).toMatchInlineSnapshot(
      '"./src/codegen/tables/Tables.sol"',
    );
    expect(renderImportPath("./src/", "codegen/tables/Tables.sol")).toMatchInlineSnapshot(
      '"./src/codegen/tables/Tables.sol"',
    );
    expect(renderImportPath("./src", "./codegen/tables/Tables.sol")).toMatchInlineSnapshot(
      '"./src/codegen/tables/Tables.sol"',
    );
    expect(renderImportPath("./src/", "./codegen/tables/Tables.sol")).toMatchInlineSnapshot(
      '"./src/codegen/tables/Tables.sol"',
    );
    expect(renderImportPath("./src", "../test/codegen/common.sol")).toMatchInlineSnapshot(
      '"./test/codegen/common.sol"',
    );
    expect(renderImportPath("./src/", "../test/codegen/common.sol")).toMatchInlineSnapshot(
      '"./test/codegen/common.sol"',
    );
  });

  it("normalizes to POSIX paths", () => {
    expect(renderImportPath("C:\\src")).toMatchInlineSnapshot('"C:/src"');
    expect(renderImportPath("C:\\src\\")).toMatchInlineSnapshot('"C:/src"');
    expect(renderImportPath("C:\\src", "./IStore.sol")).toMatchInlineSnapshot('"C:/src/IStore.sol"');
    expect(renderImportPath("C:\\src\\", "./IStore.sol")).toMatchInlineSnapshot('"C:/src/IStore.sol"');
    expect(renderImportPath("./src", ".\\IStore.sol")).toMatchInlineSnapshot('"./src/IStore.sol"');
    expect(renderImportPath("./src", ".\\IStore.sol")).toMatchInlineSnapshot('"./src/IStore.sol"');
  });
});
