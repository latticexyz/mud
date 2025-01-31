import chalk from "chalk";
import { execa } from "execa";

export function deployContracts(rpc: string) {
  const deploymentProcess = execa("pnpm", ["mud", "deploy", "--rpc", rpc], {
    cwd: "../contracts",
    stdio: "pipe",
  });

  deploymentProcess.stdout?.on("data", (data) => {
    console.log(chalk.blueBright("[mud deploy]:"), data.toString());
  });

  deploymentProcess.stderr?.on("data", (data) => {
    console.error(chalk.blueBright("[mud deploy error]:"), data.toString());
  });

  return deploymentProcess;
}
