import chalk from "chalk";
import prettier from "prettier";
import prettierPluginSolidity from "prettier-plugin-solidity";

export async function formatSolidity(content: string, prettierConfigPath?: string) {
  let config;
  if (prettierConfigPath) {
    config = await prettier.resolveConfig(prettierConfigPath);
  }
  try {
    return prettier.format(content, {
      plugins: [prettierPluginSolidity],
      parser: "solidity-parse",

      printWidth: 120,
      semi: true,
      tabWidth: 2,
      useTabs: false,
      bracketSpacing: true,

      ...config,
    });
  } catch (error) {
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = error;
    }
    console.log(chalk.yellow(`Error during output formatting: ${message}`));
    return content;
  }
}
