import { renderedSolidityHeader } from "@latticexyz/common/codegen";

export function renderTemplateIndex(templateConfig: object) {
  return `
  ${renderedSolidityHeader}
  
  ${Object.keys(templateConfig)
    .map((key) => `import {${key}Template, ${key}TemplateId} from "./templates/${key}Template.sol"`)
    .join(";")};
  `;
}
