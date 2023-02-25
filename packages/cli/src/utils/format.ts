import prettier from "prettier";
import prettierPluginSolidity from "prettier-plugin-solidity";

export async function formatSolidity(content: string, prettierConfigPath?: string) {
  let config;
  if (prettierConfigPath) {
    config = await prettier.resolveConfig(prettierConfigPath);
  }

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
}
