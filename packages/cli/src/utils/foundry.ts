import chalk from "chalk";
import { execa } from "execa";

async function safeExec(command: string, args: string[]): Promise<string> {
  try {
    console.log(chalk.gray(`running "${command} ${args.join(" ")}"`));
    const { stdout } = await execa(command, args, { stdout: "pipe", stderr: "pipe" });
    return stdout;
  } catch (error: any) {
    if (error?.stderr) {
      console.error(error.stderr);
    }
    console.error(chalk.red(`Error running "${command} ${args.join(" ")}"`));
    process.exit(1);
  }
}

export async function forge(...args: string[]): Promise<string> {
  return safeExec("forge", args);
}

export async function cast(...args: string[]): Promise<string> {
  return safeExec("cast", args);
}
