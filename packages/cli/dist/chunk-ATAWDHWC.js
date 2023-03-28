// src/utils/foundry.ts
import { execa as execa2 } from "execa";

// src/utils/execLog.ts
import chalk from "chalk";
import { execa } from "execa";
async function execLog(command, args, options) {
  const commandString = `${command} ${args.join(" ")}`;
  try {
    console.log(chalk.gray(`running "${commandString}"`));
    const { stdout } = await execa(command, args, { stdout: "pipe", stderr: "pipe", ...options });
    return stdout;
  } catch (error) {
    let errorMessage = error?.stderr || error?.message || "";
    errorMessage += chalk.red(`
Error running "${commandString}"`);
    throw new Error(errorMessage);
  }
}

// src/utils/foundry.ts
async function getForgeConfig(profile) {
  const { stdout } = await execa2("forge", ["config", "--json"], {
    stdio: ["inherit", "pipe", "pipe"],
    env: { FOUNDRY_PROFILE: profile }
  });
  return JSON.parse(stdout);
}
async function getSrcDirectory(profile) {
  return (await getForgeConfig(profile)).src;
}
async function getScriptDirectory(profile) {
  return (await getForgeConfig(profile)).script;
}
async function getTestDirectory(profile) {
  return (await getForgeConfig(profile)).test;
}
async function getOutDirectory(profile) {
  return (await getForgeConfig(profile)).out;
}
async function getRpcUrl(profile) {
  return (await getForgeConfig(profile)).eth_rpc_url || "http://127.0.0.1:8545";
}
async function forge(args, options) {
  const execOptions = {
    env: { FOUNDRY_PROFILE: options?.profile },
    stdout: "inherit",
    stderr: "pipe"
  };
  await (options?.silent ? execa2("forge", args, execOptions) : execLog("forge", args, execOptions));
}
async function cast(args, options) {
  return execLog("cast", args, {
    env: { FOUNDRY_PROFILE: options?.profile }
  });
}

export {
  getForgeConfig,
  getSrcDirectory,
  getScriptDirectory,
  getTestDirectory,
  getOutDirectory,
  getRpcUrl,
  forge,
  cast
};
