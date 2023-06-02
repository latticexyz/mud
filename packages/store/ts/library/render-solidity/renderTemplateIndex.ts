import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { StoreConfig, Templates } from "../config";

export function renderTemplateIndex(templateConfig: Templates<StoreConfig>) {
  return `
  ${renderedSolidityHeader}
  
  ${Object.keys(templateConfig)
    .map((key) => `import {${key}Template, ${key}TemplateId} from "./templates/${key}Template.sol"`)
    .join(";")};
  `;
}
