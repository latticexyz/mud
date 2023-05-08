import { renderedSolidityHeader } from "@latticexyz/common/codegen";

export function renderTemplateIndex(templateConfig: { templates: object }) {
  return `
  ${renderedSolidityHeader}
  
  ${Object.keys(templateConfig.templates)
    .map((key) => `import {${key}Template, ${key}TemplateId} from "./templates/${key}Template.sol"`)
    .join(";")};
  `;
}
