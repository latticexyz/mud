import { renderedSolidityHeader } from "./common";

// importing this from config or store would be a cyclic dependency :(
type Enums = {
  readonly [name: string]: readonly [string, ...string[]];
};

/**
 * Render a list of enum data as solidity enum definitions
 */
export function renderEnums(enums: Enums): string {
  const enumDefinitions = Object.entries(enums).map(
    ([name, values]) => `
      enum ${name} {
        ${values.join(", ")}
      }
    `,
  );

  return `
    ${renderedSolidityHeader}
    ${enumDefinitions.join("")}
  `;
}
