import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { StoreConfig, Templates } from "../config";

export function renderTemplateIndex(templates: Templates<StoreConfig>) {
  return `
  ${renderedSolidityHeader}
  
  ${Object.keys(templates)
    .map((key) => `import {${key}Template, ${key}TemplateId} from "./templates/${key}Template.sol"`)
    .join(";")};
  `;
}
