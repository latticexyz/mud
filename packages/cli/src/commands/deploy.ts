/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { constants, ethers } from "ethers";
import inquirer from "inquirer";
import { v4 } from "uuid";
import { Listr, Logger } from "listr2";
import { exit } from "process";
import fs from "fs";
import openurl from "openurl";
import ips from "inquirer-prompt-suggest";
import { Arguments, CommandBuilder } from "yargs";
inquirer.registerPrompt("suggest", ips);

// Workaround to prevent tsc to transpile dynamic imports with require, which causes an error upstream
// https://github.com/microsoft/TypeScript/issues/43329#issuecomment-922544562
const importNetlify = eval('import("netlify")') as Promise<typeof import("netlify")>;
const importChalk = eval('import("chalk")') as Promise<typeof import("chalk")>;
const importExeca = eval('import("execa")') as Promise<typeof import("execa")>;
const importFetch = eval('import("node-fetch")') as Promise<typeof import("node-fetch")>;

interface Options {
  i?: boolean;
  chainSpec?: string;
  chainId?: number;
  rpc?: string;
  wsRpc?: string;
  world?: string;
  reuseComponents?: boolean;
  deployerPrivateKey?: string;
  deployClient?: boolean;
  clientUrl?: string;
  netlifySlug?: string;
  netlifyPersonalToken?: string;
  upgradeSystems?: boolean;
  codespace?: boolean;
  dry?: boolean;
}

export const command = "deploy";
export const desc = "Deploys the local mud contracts and optionally the client";

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.options({
    i: { type: "boolean" },
    chainSpec: { type: "string" },
    chainId: { type: "number" },
    rpc: { type: "string" },
    wsRpc: { type: "string" },
    world: { type: "string" },
    reuseComponents: { type: "boolean" },
    deployerPrivateKey: { type: "string" },
    deployClient: { type: "boolean" },
    clientUrl: { type: "string" },
    netlifySlug: { type: "string" },
    netlifyPersonalToken: { type: "string" },
    upgradeSystems: { type: "boolean" },
    codespace: { type: "boolean" },
    dry: { type: "boolean" },
  });

export const handler = async (args: Arguments<Options>): Promise<void> => {
  const info = await getDeployInfo(args);
  await deploy(info);
};

function isValidHttpUrl(s: string): boolean {
  let url: URL | undefined;

  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function findLog(deployLogLines: string[], log: string): string {
  for (const logLine of deployLogLines) {
    if (logLine.includes(log)) {
      return logLine.split(log)[1].trim();
    }
  }
  throw new Error("Can not find log");
}

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
    console.log("Netlify api");
    const accounts = await netlifyAPI.listAccountsForUser();
    console.log("Accounts");
    return accounts.map((a: { slug: string }) => a.slug);
  };

  const defaultOptions: Options = {
    chainSpec: "chainSpec.json",
    chainId: 31337,
    rpc: "http://localhost:8545",
    wsRpc: "ws://localhost:8545",
    reuseComponents: false,
    deployClient: false,
    clientUrl: "http://localhost:3000",
    upgradeSystems: false,
  };

  const { default: fetch } = await importFetch;

  // Fetch deployed lattice chains
  const latticeChains = args.i
    ? ((await (await fetch("https://registry.lattice.xyz/api?update=true")).json()) as
        | { specUrl: string }[]
        | undefined)
    : [];

  const chainSpecs = latticeChains?.map((e) => e.specUrl) || [];
  console.log("Available Lattice chains");
  console.log(JSON.stringify(latticeChains, null, 2));

  const answers: Options =
    args.upgradeSystems && !args.world
      ? await inquirer.prompt([
          {
            type: "input",
            name: "world",
            message: "Provide the address of the World contract to upgrade the systems on.",
            when: () => args.world == null && config.world == null,
            validate: (i) => {
              if (!i || (i[0] == "0" && i[1] == "x" && i.length === 42)) return true;
              return "Invalid address";
            },
          },
        ])
      : args.i
      ? await inquirer.prompt([
          {
            type: "suggest",
            name: "chainSpec",
            message: "Provide a chainSpec.json location (local or remote)",
            suggestions: chainSpecs,
            when: () => args.chainSpec == null && config.chainSpec == null,
          },
          {
            type: "number",
            name: "chainId",
            default: defaultOptions.chainId,
            message: "Provide a chainId for the deployment",
            when: (answers) => answers.chainSpec == null && args.chainId == null && config.chainSpec == null,
          },
          {
            type: "input",
            name: "wsRpc",
            default: defaultOptions.wsRpc,
            message: "Provide a WebSocket RPC endpoint for your deployment",
            when: (answers) => answers.chainSpec == null && args.wsRpc == null && config.wsRpc == null,
          },
          {
            type: "input",
            name: "rpc",
            default: defaultOptions.rpc,
            message: "Provide a JSON RPC endpoint for your deployment",
            when: (answers) => answers.chainSpec == null && args.rpc == null && config.rpc == null,
            validate: (i) => {
              if (isValidHttpUrl(i)) return true;
              return "Invalid URL";
            },
          },
          {
            type: "input",
            name: "world",
            message:
              "Provide the address of an existing World contract. (If none is given, a new World will be deployed.)",
            when: () => args.world == null && config.world == null,
            validate: (i) => {
              if (!i || (i[0] == "0" && i[1] == "x" && i.length === 42)) return true;
              return "Invalid address";
            },
          },
          {
            type: "list",
            name: "upgradeSystems",
            message: "Only upgrade systems?",
            choices: [
              { name: "Yes", value: true },
              { name: "No", value: false },
            ],
            default: defaultOptions.upgradeSystems,
            when: (answers) =>
              (args.world || config.world || answers.world) &&
              args.upgradeSystems == null &&
              config.upgradeSystems == null,
          },
          {
            type: "list",
            name: "reuseComponents",
            message: "Reuse existing components?",
            choices: [
              { name: "Yes", value: true },
              { name: "No", value: false },
            ],
            default: defaultOptions.reuseComponents,
            when: (answers) =>
              !answers.upgradeSystems &&
              !args.upgradeSystems &&
              !config.upgradeSystems &&
              args.reuseComponents == null &&
              config.reuseComponents == null,
          },
          {
            type: "input",
            name: "deployerPrivateKey",
            message: "Enter private key of the deployer account:",
            when: () => !args.deployerPrivateKey && !config.deployerPrivateKey,
            validate: (i) => {
              if (i[0] == "0" && i[1] == "x" && i.length === 66) return true;
              return "Invalid private key";
            },
          },
          {
            type: "list",
            message: "Deploy the client?",
            choices: [
              { name: "Yes", value: true },
              { name: "No", value: false },
            ],
            default: defaultOptions.deployClient,
            name: "deployClient",
            when: () => args.deployClient == null && config.deployClient == null,
          },
          {
            type: "input",
            name: "netlifyPersonalToken",
            message: "Enter a netlify personal token for deploying the client:",
            when: (answers) => answers.deployClient && !args.netlifyPersonalToken && !config.netlifyPersonalToken,
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
            message: "Enter URL of an already deployed client:",
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
        ])
      : ({} as Options);

  const chainSpecUrl = args.chainSpec ?? config.chainSpec ?? answers.chainSpec;
  const chainSpec = !chainSpecUrl
    ? null
    : isValidHttpUrl(chainSpecUrl)
    ? await (await fetch(chainSpecUrl)).json()
    : JSON.parse(fs.readFileSync(chainSpecUrl, "utf8"));

  // Priority of config source: command line args >> chainSpec >> local config >> interactive answers >> defaults
  // -> Command line args can override every other config, interactive questions are only asked if no other config given for this option

  return {
    chainSpec: args.chainSpec ?? config.chainSpec ?? answers.chainSpec ?? defaultOptions.chainSpec,
    chainId: args.chainId ?? chainSpec?.chainId ?? config.chainId ?? answers.chainId ?? defaultOptions.chainId,
    rpc: args.rpc ?? chainSpec?.rpc ?? config.rpc ?? answers.rpc ?? defaultOptions.rpc,
    wsRpc: args.wsRpc ?? chainSpec?.wsRpc ?? config.wsRpc ?? answers.wsRpc ?? defaultOptions.wsRpc,
    world: args.world ?? chainSpec?.world ?? config.world ?? answers.world,
    upgradeSystems: args.upgradeSystems ?? config.upgradeSystems ?? answers.upgradeSystems,
    reuseComponents:
      args.reuseComponents ?? config.reuseComponents ?? answers.reuseComponents ?? defaultOptions.reuseComponents,
    deployerPrivateKey: args.deployerPrivateKey ?? config.deployerPrivateKey ?? answers.deployerPrivateKey,
    deployClient: args.deployClient ?? config.deployClient ?? answers.deployClient ?? defaultOptions.deployClient,
    clientUrl: args.clientUrl ?? config.clientUrl ?? answers.clientUrl ?? defaultOptions.clientUrl,
    netlifySlug: args.netlifySlug ?? config.netlifySlug ?? answers.netlifySlug,
    netlifyPersonalToken: args.netlifyPersonalToken ?? config.netlifyPersonalToken ?? answers.netlifyPersonalToken,
    codespace: args.codespace,
    dry: args.dry,
  };
};

export const deploy = async (options: Options) => {
  const { default: chalk } = await importChalk;
  const { execa } = await importExeca;
  console.log();
  console.log(chalk.yellow(`>> Deploying contracts <<`));

  console.log("Options");
  console.log(options);

  const wallet = new ethers.Wallet(options.deployerPrivateKey!);
  console.log(chalk.red(`>> Deployer address: ${chalk.bgYellow.black.bold(" " + wallet.address + " ")} <<`));
  console.log();

  const logger = new Logger({ useIcons: true });

  const { NetlifyAPI: netlify } = await importNetlify;

  const netlifyAPI = options.deployClient && new netlify(options.netlifyPersonalToken);
  const id = v4().substring(0, 6);

  let launcherUrl;
  let worldAddress;

  const cmdArgs = options.upgradeSystems
    ? [
        "workspace",
        "contracts",
        "forge:deploy",
        ...(options.dry ? [] : ["--broadcast", "--private-keys", wallet.privateKey]),
        "--sig",
        "upgradeSystems(address,address)",
        wallet.address,
        options.world || constants.AddressZero,
        "--fork-url",
        options.rpc!,
      ]
    : [
        "workspace",
        "contracts",
        "forge:deploy",
        ...(options.dry ? [] : ["--broadcast", "--private-keys", wallet.privateKey]),
        "--sig",
        "deploy(address,address,bool)",
        wallet.address,
        options.world || constants.AddressZero,
        options.reuseComponents ? "true" : "false",
        "--fork-url",
        options.rpc!,
      ];

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
                  const child = execa("yarn", cmdArgs);
                  child.stdout?.pipe(task.stdout());
                  const { stdout } = await child;
                  const lines = stdout.split("\n");

                  ctx.worldAddress = worldAddress = findLog(lines, "world: address");
                  ctx.initialBlockNumber = findLog(lines, "initialBlockNumber: uint256");
                  task.output = chalk.yellow(`World deployed at: ${chalk.bgYellow.black(ctx.worldAddress)}`);
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
                              name: `mud-deployment-${wallet.address.substring(2, 8)}-${id}`,
                              account_slug: options.netlifySlug,
                              ssl: true,
                              force_ssl: true,
                            },
                          });
                          ctx.siteId = site.id;
                          ctx.clientUrl = site.ssl_url;
                          task.output = "Netlify site created with id: " + chalk.bgYellow.black(site.id);
                        },
                        skip: () => !options.deployClient,
                        options: { bottomBar: 1 },
                      },
                      {
                        title: "Deploying",
                        task: async (ctx, task) => {
                          const child = execa(
                            "yarn",
                            ["workspace", "client", "run", "netlify", "deploy", "--prod", "--dir", "dist"],
                            {
                              env: {
                                NETLIFY_AUTH_TOKEN: options.netlifyPersonalToken,
                                NETLIFY_SITE_ID: ctx.siteId,
                              },
                            }
                          );
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
                title: "Open Launcher",
                task: async (ctx) => {
                  function getCodespaceUrl(port: number, protocol = "https") {
                    return `${protocol}://${process.env["CODESPACE_NAME"]}-${port}.app.online.visualstudio.com`;
                  }

                  let clientUrl = options.deployClient ? ctx.clientUrl : options.clientUrl;

                  if (options.codespace) {
                    clientUrl = getCodespaceUrl(3000);
                    options.rpc = getCodespaceUrl(8545);
                  }

                  launcherUrl = `${clientUrl}?chainId=${options.chainId}&worldAddress=${ctx.worldAddress}&rpc=${options.rpc}&wsRpc=${options.wsRpc}&initialBlockNumber=${ctx.initialBlockNumber}&dev=true&snapshot=&stream=&relay=&faucet=`;

                  // Launcher version:
                  // `https://play.lattice.xyz?worldAddress=${ctx.worldAddress || ""}&client=${
                  //   clientUrl || ""
                  // }&rpc=${options.rpc || ""}&wsRpc=${options.wsRpc || ""}&chainId=${options.chainId || ""}&dev=${
                  //   options.chainId === 31337 || ""
                  // }&initialBlockNumber=${ctx.initialBlockNumber}`;

                  if (!options.upgradeSystems) openurl.open(launcherUrl);
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
    console.log(chalk.bgGreen.black.bold(" Congratulations! Deployment successful"));
    console.log();
    console.log(chalk.green(`World address ${worldAddress}`));
    console.log(chalk.green(`Open launcher at ${launcherUrl}`));
    console.log();
  } catch (e) {
    logger.fail((e as Error).message);
  }
  exit(0);
};
