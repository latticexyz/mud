import { renderedSolidityHeader } from "@latticexyz/common/codegen";

export function renderTemplateScript(templateConfig: { templates: object }) {
  return `
  ${renderedSolidityHeader}
  
  import {${Object.keys(templateConfig.templates)
    .map((key) => `${key}Template`)
    .join(",")}} from "../Templates.sol";
  
  function createTemplates() {
    ${Object.keys(templateConfig.templates)
      .map((key) => `${key}Template()`)
      .join(";")};
  }`;
}
