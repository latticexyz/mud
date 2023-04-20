import { renderArguments, renderList, renderedSolidityHeader } from "./common.js";
import { RenderEnum } from "./types.js";

export function renderEnums(enums: RenderEnum[]) {
  let result = renderedSolidityHeader;

  result += renderList(
    enums,
    ({ name, memberNames }) => `
    enum ${name} {
      ${renderArguments(memberNames)}
    }
  `
  );

  return result;
}
