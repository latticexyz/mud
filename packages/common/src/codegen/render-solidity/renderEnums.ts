import { renderArguments, renderList, renderedSolidityHeader } from "./common";
import { RenderEnum } from "./types";

/**
 * Render a list of enum data as solidity enum definitions
 */
export function renderEnums(enums: RenderEnum[]): string {
  let result = renderedSolidityHeader;

  result += renderList(
    enums,
    ({ name, memberNames }) => `
    enum ${name} {
      ${renderArguments(memberNames)}
    }
  `,
  );

  return result;
}
