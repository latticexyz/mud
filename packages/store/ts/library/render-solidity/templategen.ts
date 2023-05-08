import path from "path";
import { formatAndWriteSolidity } from "@latticexyz/common/codegen";
import { StoreConfig } from "../config";
import { renderTemplateIndex } from "./renderTemplateIndex";
import { renderTemplateScript } from "./renderTemplateScript";
import { renderTemplate } from "./renderTemplate";

const generateIndex = async (templateConfig: { templates: object }, outputBaseDirectory: string) => {
  const output = renderTemplateIndex(templateConfig);
  const fullOutputPath = path.join(outputBaseDirectory, `Templates.sol`);

  await formatAndWriteSolidity(output, fullOutputPath, "Generated index");
};

const generateSystem = async (templateConfig: { templates: object }, outputBaseDirectory: string) => {
  const output = renderTemplateScript(templateConfig);

  const fullOutputPath = path.join(outputBaseDirectory, `scripts/CreateTemplates.sol`);
  await formatAndWriteSolidity(output, fullOutputPath, "Generated system");
};

const generateTemplates = async (
  mudConfig: StoreConfig,
  templateConfig: { templates: object },
  outputBaseDirectory: string
) => {
  for (const name of Object.keys(templateConfig.templates)) {
    const output = renderTemplate(mudConfig, templateConfig, name);
    const fullOutputPath = path.join(outputBaseDirectory, `templates/${name}Template.sol`);

    await formatAndWriteSolidity(output, fullOutputPath, "Generated template");
  }
};

export async function templategen(
  mudConfig: StoreConfig,
  templateConfig: { templates: object },
  outputBaseDirectory: string
) {
  generateSystem(templateConfig, outputBaseDirectory);
  generateIndex(templateConfig, outputBaseDirectory);
  generateTemplates(mudConfig, templateConfig, outputBaseDirectory);
}
