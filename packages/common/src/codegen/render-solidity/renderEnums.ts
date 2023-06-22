import { renderArguments, renderList, renderedSolidityHeader } from "./common";
import { RenderEnum } from "./types";

export function renderEnums(enums: RenderEnum[]): string {
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
