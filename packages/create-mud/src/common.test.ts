import { describe, expect, it } from "vitest";
import { glob } from "glob";
import { templates } from "./common";

describe("templates", () => {
  it("matches what is in the file system", async () => {
    const availableTemplates = await glob("*", {
      maxDepth: 1,
      cwd: `${__dirname}/../dist/templates`,
    });
    expect(templates).toEqual(expect.arrayContaining(availableTemplates));
    expect(availableTemplates).toEqual(expect.arrayContaining(templates));
  });
});
