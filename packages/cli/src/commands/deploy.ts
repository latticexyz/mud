/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { ethers } from "ethers";
import inquirer from "inquirer";
import { v4 } from "uuid";
import { Listr, Logger } from "listr2";
import { exit } from "process";
import fs from "fs";
import openurl from "openurl";
import ips from "inquirer-prompt-suggest";
import { Arguments, CommandBuilder } from "yargs";
inquirer.registerPrompt("suggest", ips);

// Workaround to prevent tsc to transpole dynamic imports with require, which causes an error upstream
// https://github.com/microsoft/TypeScript/issues/43329#issuecomment-922544562
const importNetlify = eval('import("netlify")') as Promise<typeof import("netlify")>;
const importChalk = eval('import("chalk")') as Promise<typeof import("chalk")>;
const importExeca = eval('import("execa")') as Promise<typeof import("execa")>;

interface Options {
  chainId?: number;
  deploymentName?: string;
  deployClient?: boolean;
  clientUrl?: string;
  netlifySlug?: string;
  netlifyPersonalToken?: string;
  deployerPrivateKey?: string;
}

interface Network {
  network: string;
  name: string;
  rpcUrl: string;
  chainId: number;
}

export const command = "deploy";
export const desc = "Deploys the local mud contracts and optionally the client";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    chainId: { type: "number" },
    deploymentName: { type: "string" },
    deployClient: { type: "boolean" },
    clientUrl: { type: "string" },
    netlifySlug: { type: "string" },
    netlifyPersonalToken: { type: "string" },
    deployerPrivateKey: { type: "string" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const info = await getDeployInfo(args);
  await deploy(info);
};

export function isValidHttpUrl(s: string): boolean {
  let url: URL | undefined;

  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

export const findGameContractAddress = (deployLogLines: string[]): string => {
  for (const logLine of deployLogLines) {
    if (logLine.includes("0: address")) {
      return logLine.split(" ")[2].trim();
    }
  }
  throw new Error("Expected to find a log line for the deployed game");
};

export const SUPPORTED_DEPLOYMENT_CHAINS: { [key: number]: Network } = {
  // 69: {
  //   name: "Optimistic Kovan",
  //   network: "optimisticKovan",
  //   rpcUrl: "https://kovan.optimism.io",
  // },
  // 300: {
  //   name: "Optimism Gnosis Chain",
  //   network: "optimismGnosisChain",
  //   rpcUrl: "https://optimism.gnosischain.com",
  // },
  31337: {
    name: "Local",
    network: "localhost",
    rpcUrl: "http://localhost:8545/",
    chainId: 31337,
  },
  6969: {
    name: "Lattice Degen Chain",
    network: "ldc",
    rpcUrl: "https://degen-chain.lattice.xyz/",
    chainId: 6969,
  },
};

const getDeployInfo: (args: Arguments<Options>) => Promise<Options> = async (args) => {
  const { default: chalk } = await importChalk;
  console.log();
  console.log(chalk.bgWhite.black.bold(" == Mud Deployer == "));
  console.log();

  let config: Options = {};
  try {
    config = JSON.parse(fs.readFileSync("mud.config.json", "utf8"));
  } catch (e) {
    console.log("No mud.config.json found, using command line args");
  }

  const getNetlifyAccounts = async (token: string) => {
    const { NetlifyAPI: netlify } = await importNetlify;
    const netlifyAPI = new netlify(token);
    return (await netlifyAPI.listAccountsForUser()).map((a: { slug: string }) => a.slug);
  };
  const answers: Options = (await inquirer.prompt([
    {
      type: "list",
      name: "chainId",
      choices: Object.entries(SUPPORTED_DEPLOYMENT_CHAINS).map(([chainId, network]) => ({
        name: network.name,
        value: parseInt(chainId),
      })),
      message: "Select an available chain",
      loop: false,
      when: () => args.chainId == null && config.chainId == null,
    },
    {
      type: "suggest",
      name: "deploymentName",
      message: "Enter a name for your deployment:",
      suggestions: ["mud game"],
      validate: (input: string) => {
        if (input.length < 4) {
          return "Invalid: 4 characters minimum";
        }
        return true;
      },
      when: () => !args.deploymentName && !config.deploymentName,
    },
    {
      type: "input",
      name: "deployerPrivateKey",
      message: "Enter private key of the account you want to deploy with:",
      when: () => !args.deployerPrivateKey && !config.deployerPrivateKey,
      validate: (i) => {
        if (i[0] == "0" && i[1] && i.length === 66) return true;
        return "Invalid private key";
      },
    },
    {
      type: "list",
      message: "Would you like to deploy the game client?",
      choices: [
        { name: "Yes", value: true },
        { name: "No", value: false },
      ],
      default: false,
      name: "deployClient",
      validate: (i) => {
        if (Boolean(i) && config.netlifyPersonalToken && config.netlifyPersonalToken.length === 0) {
          return "You don't have a netlify api token. Can't deploy clients using the cli.";
        }
      },
      when: () => args.deployClient == null && config.deployClient == null,
    },
    {
      type: "input",
      name: "netlifyPersonalToken",
      message: "Enter your netlify personal token:",
      when: (answers) => answers.deployClient && !args.netlifyPersonalToken && !config.netlifyPersonalToken,
      validate: (i) => {
        if (i[0] == "0" && i[1] && i.length === 66) return true;
        return "Invalid private key";
      },
    },
    {
      type: "list",
      message: "From which netlify account?",
      choices: async (answers) =>
        await getNetlifyAccounts(
          args.netlifyPersonalToken ?? config.netlifyPersonalToken ?? answers.netlifyPersonalToken!
        ),
      name: "netlifySlug",
      when: (answers) => answers.deployClient && !args.netlifySlug && !config.netlifySlug,
    },
    {
      type: "input",
      name: "clientUrl",
      message: "Enter URL of already deployed client:",
      when: (answers) => !answers.deployClient && !args.clientUrl && !config.clientUrl,
      default: "http://localhost:3000",
      validate: (i) => {
        if (isValidHttpUrl(i)) {
          if (i[i.length - 1] === "/") {
            return "No trailing slash";
          }
          return true;
        } else {
          return "Not a valid URL";
        }
      },
    },
  ])) as Options;

  return {
    chainId: args.chainId ?? config.chainId ?? answers.chainId,
    deploymentName: args.deploymentName ?? config.deploymentName ?? answers.deploymentName,
    deployerPrivateKey: args.deployerPrivateKey ?? config.deployerPrivateKey ?? answers.netlifyPersonalToken,
    deployClient: args.deployClient ?? config.deployClient ?? answers.deployClient,
    netlifySlug: args.netlifySlug ?? config.netlifySlug ?? answers.netlifySlug,
    clientUrl: args.clientUrl ?? config.clientUrl ?? answers.clientUrl,
    netlifyPersonalToken: args.netlifyPersonalToken ?? config.netlifyPersonalToken ?? answers.netlifyPersonalToken,
  };
};

export const deploy = async (options: Options) => {
  const { default: chalk } = await importChalk;
  const { execa } = await importExeca;
  console.log();
  console.log(chalk.yellow(`>> Deploying ${chalk.bgYellow.black.bold(" " + options.deploymentName + " ")} <<`));

  const wallet = new ethers.Wallet(options.deployerPrivateKey!);
  console.log(chalk.red(`>> Deployer address: ${chalk.bgYellow.black.bold(" " + wallet.address + " ")} <<`));
  console.log();

  const network = SUPPORTED_DEPLOYMENT_CHAINS[options.chainId!];
  const logger = new Logger({ useIcons: true });

  const { NetlifyAPI: netlify } = await importNetlify;

  const netlifyAPI = options.deployClient && new netlify(options.netlifyPersonalToken);
  const id = v4().substring(0, 6);

  let gameContractAddress: string | undefined = undefined;
  let gameClientUrl: string | undefined = undefined;

  try {
    const tasks = new Listr([
      {
        title: "Deploying",
        task: () => {
          return new Listr(
            [
              {
                title: "Contracts",
                task: async (ctx, task) => {
                  const child = execa("yarn", [
                    "workspace",
                    "ri-contracts",
                    "forge:deploy",
                    "--private-keys",
                    wallet.privateKey,
                    "--sig",
                    "deployEmber(address)",
                    wallet.address,
                    "--fork-url",
                    network.rpcUrl,
                  ]);
                  child.stdout?.pipe(task.stdout());
                  const { stdout } = await child;
                  const lines = stdout.split("\n");

                  gameContractAddress = findGameContractAddress(lines);
                  ctx.gameContractAddress = gameContractAddress;

                  task.output = chalk.yellow(
                    `Game deployed at: ${chalk.bgYellow.black(gameContractAddress)} on chain: ${chalk.bgYellow.black(
                      network.name
                    )}`
                  );
                },
                options: { bottomBar: 3 },
              },
              {
                title: "Client",
                task: () => {
                  return new Listr(
                    [
                      {
                        title: "Building",
                        task: async (_, task) => {
                          const time = Date.now();
                          task.output = "Building local client...";
                          const child = execa("yarn", ["workspace", "client", "build"]);
                          await child;
                          const duration = Date.now() - time;
                          task.output = "Client built in " + Math.round(duration / 1000) + "s";
                        },
                        skip: () => !options.deployClient,
                        options: { bottomBar: 3 },
                      },
                      {
                        title: "Creating",
                        task: async (ctx, task) => {
                          const site = await netlifyAPI.createSite({
                            body: {
                              name: `lattice-starterkit-deployment-${wallet.address.substring(2, 8)}-${id}`,
                              account_slug: options.netlifySlug,
                              ssl: true,
                              force_ssl: true,
                            },
                          });
                          ctx.siteId = site.id;
                          ctx.clientUrl = site.ssl_url;
                          gameClientUrl = site.ssl_url;

                          task.output = "Netlify site created with id: " + chalk.bgYellow.black(site.id);
                        },
                        skip: () => !options.deployClient,
                        options: { bottomBar: 1 },
                      },
                      {
                        title: "Deploying",
                        task: async (ctx, task) => {
                          const child = execa("yarn", ["workspace", "client", "run", "netlify", "deploy", "--prod"], {
                            env: {
                              NETLIFY_AUTH_TOKEN: options.netlifyPersonalToken,
                              NETLIFY_SITE_ID: ctx.siteId,
                            },
                          });
                          child.stdout?.pipe(task.stdout());
                          await child;
                          task.output = chalk.yellow("Netlify site deployed!");
                        },
                        skip: () => !options.deployClient,
                        options: { bottomBar: 3 },
                      },
                    ],
                    { concurrent: false }
                  );
                },
              },
              {
                title: "Redirect to Lattice Launcher",
                task: async (ctx) => {
                  const gameContractAddress = ctx.gameContractAddress;
                  const clientUrl = options.deployClient ? ctx.clientUrl : options.clientUrl;
                  const deepLinkURI = `lattice://deployFromCLI?gameContractAddress=${gameContractAddress}&chainId=${options.chainId}&clientUrl=${clientUrl}&name=${options.deploymentName}`;
                  openurl.open(deepLinkURI);
                },
                options: { bottomBar: 3 },
              },
            ],
            { concurrent: false }
          );
        },
      },
    ]);
    await tasks.run();
    console.log();
    console.log(chalk.bgGreen.black.bold(" Congratulations! Deployment successful"));
    console.log();
    console.log(chalk.green(`Game contract deployed to ${gameContractAddress}`));
    console.log(chalk.green(`Game client deployed to ${gameClientUrl}`));
    console.log();
  } catch (e) {
    logger.fail((e as Error).message);
  }
  exit(0);
};
