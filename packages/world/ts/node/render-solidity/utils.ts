import { renderArguments, ParsedParameter } from "@latticexyz/common/codegen";

export function renderReturnParameters(returnParameters: ParsedParameter[]) {
  if (returnParameters.length > 0) {
    return `returns (${renderArguments(returnParameters.map(({ typedNameWithLocation }) => typedNameWithLocation))})`;
  } else {
    return "";
  }
}

export function renderArgumentParameters(argumentParameters: ParsedParameter[]) {
  return renderArguments(argumentParameters.map(({ typedNameWithLocation }) => typedNameWithLocation));
}
