import { renderedSolidityHeader } from "@latticexyz/common/codegen";
import { StoreConfig, Templates } from "../config";

export function renderTemplateScript(templateConfig: Templates<StoreConfig>) {
  return `
  ${renderedSolidityHeader}
  
  import { IStore } from "@latticexyz/store/src/IStore.sol";

  import {${Object.keys(templateConfig)
    .map((key) => `${key}Template`)
    .join(",")}} from "../Templates.sol";
  
  function createTemplates() {
    ${Object.keys(templateConfig)
      .map((key) => `${key}Template()`)
      .join(";")};
  }

  function createTemplates(IStore store) {
    ${Object.keys(templateConfig)
      .map((key) => `${key}Template(store)`)
      .join(";")};
  }`;
}
