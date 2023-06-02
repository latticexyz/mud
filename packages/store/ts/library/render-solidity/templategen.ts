import path from "path";
import { formatAndWriteSolidity } from "@latticexyz/common/codegen";
import { StoreConfig, Templates } from "../config";
import { renderTemplateIndex } from "./renderTemplateIndex";
import { renderTemplateScript } from "./renderTemplateScript";
import { renderTemplate } from "./renderTemplate";

const generateIndex = async (templateConfig: Templates<StoreConfig>, outputBaseDirectory: string) => {
  const output = renderTemplateIndex(templateConfig);
  const fullOutputPath = path.join(outputBaseDirectory, `Templates.sol`);

  await formatAndWriteSolidity(output, fullOutputPath, "Generated index");
};

const generateSystem = async (templateConfig: Templates<StoreConfig>, outputBaseDirectory: string) => {
  const output = renderTemplateScript(templateConfig);

  const fullOutputPath = path.join(outputBaseDirectory, `scripts/CreateTemplates.sol`);
  await formatAndWriteSolidity(output, fullOutputPath, "Generated system");
};

const generateTemplates = async (
  config: StoreConfig & { templates: Templates<StoreConfig> },
  outputBaseDirectory: string
) => {
  for (const name of Object.keys(config.templates)) {
    const output = renderTemplate(config, name);
    const fullOutputPath = path.join(outputBaseDirectory, `templates/${name}Template.sol`);

    await formatAndWriteSolidity(output, fullOutputPath, "Generated template");
  }
};

export async function templategen(
  config: StoreConfig & { templates: Templates<StoreConfig> },
  outputBaseDirectory: string
) {
  generateSystem(config.templates, outputBaseDirectory);
  generateIndex(config.templates, outputBaseDirectory);
  generateTemplates(config, outputBaseDirectory);
}
