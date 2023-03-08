import chalk from "chalk";
import { execa } from "execa";

export async function formatSolidity(content: string) {
  try {
    const { stdout } = await execa("forge", ["fmt", "--raw", "-"], { input: content });
    return stdout;
  } catch (error) {
    console.log(chalk.yellow(`Error during output formatting: ${error}`));
    return content;
  }
}
