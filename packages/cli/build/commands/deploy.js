"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = exports.SUPPORTED_DEPLOYMENT_CHAINS = exports.findGameContractAddress = exports.isValidHttpUrl = exports.handler = exports.builder = exports.desc = exports.command = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ethers_1 = require("ethers");
const inquirer_1 = __importDefault(require("inquirer"));
const uuid_1 = require("uuid");
const listr2_1 = require("listr2");
const process_1 = require("process");
const fs_1 = __importDefault(require("fs"));
const openurl_1 = __importDefault(require("openurl"));
const inquirer_prompt_suggest_1 = __importDefault(require("inquirer-prompt-suggest"));
inquirer_1.default.registerPrompt("suggest", inquirer_prompt_suggest_1.default);
// Workaround to prevent tsc to transpole dynamic imports with require, which causes an error upstream
// https://github.com/microsoft/TypeScript/issues/43329#issuecomment-922544562
const importNetlify = eval('import("netlify")');
const importChalk = eval('import("chalk")');
const importExeca = eval('import("execa")');
exports.command = "deploy";
exports.desc = "Deploys the local mud contracts and optionally the client";
const builder = (yargs) => yargs.options({
    chainId: { type: "number" },
    deploymentName: { type: "string" },
    deployClient: { type: "boolean" },
    clientUrl: { type: "string" },
    netlifySlug: { type: "string" },
    netlifyPersonalToken: { type: "string" },
    deployerPrivateKey: { type: "string" },
});
exports.builder = builder;
const handler = (args) => __awaiter(void 0, void 0, void 0, function* () {
    const info = yield getDeployInfo(args);
    yield (0, exports.deploy)(info);
});
exports.handler = handler;
function isValidHttpUrl(s) {
    let url;
    try {
        url = new URL(s);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}
exports.isValidHttpUrl = isValidHttpUrl;
const findGameContractAddress = (deployLogLines) => {
    for (const logLine of deployLogLines) {
        if (logLine.includes("0: address")) {
            return logLine.split(" ")[2].trim();
        }
    }
    throw new Error("Expected to find a log line for the deployed game");
};
exports.findGameContractAddress = findGameContractAddress;
exports.SUPPORTED_DEPLOYMENT_CHAINS = {
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
const getDeployInfo = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { default: chalk } = yield importChalk;
    console.log();
    console.log(chalk.bgWhite.black.bold(" == Mud Deployer == "));
    console.log();
    let config = {};
    try {
        config = JSON.parse(fs_1.default.readFileSync("mud.config.json", "utf8"));
    }
    catch (e) {
        console.log("No mud.config.json found, using command line args");
    }
    const getNetlifyAccounts = (token) => __awaiter(void 0, void 0, void 0, function* () {
        const { NetlifyAPI: netlify } = yield importNetlify;
        const netlifyAPI = new netlify(token);
        return (yield netlifyAPI.listAccountsForUser()).map((a) => a.slug);
    });
    const answers = (yield inquirer_1.default.prompt([
        {
            type: "list",
            name: "chainId",
            choices: Object.entries(exports.SUPPORTED_DEPLOYMENT_CHAINS).map(([chainId, network]) => ({
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
            validate: (input) => {
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
                if (i[0] == "0" && i[1] && i.length === 66)
                    return true;
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
                if (i[0] == "0" && i[1] && i.length === 66)
                    return true;
                return "Invalid private key";
            },
        },
        {
            type: "list",
            message: "From which netlify account?",
            choices: (answers) => __awaiter(void 0, void 0, void 0, function* () {
                var _q, _r;
                return yield getNetlifyAccounts((_r = (_q = args.netlifyPersonalToken) !== null && _q !== void 0 ? _q : config.netlifyPersonalToken) !== null && _r !== void 0 ? _r : answers.netlifyPersonalToken);
            }),
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
                }
                else {
                    return "Not a valid URL";
                }
            },
        },
    ]));
    return {
        chainId: (_b = (_a = args.chainId) !== null && _a !== void 0 ? _a : config.chainId) !== null && _b !== void 0 ? _b : answers.chainId,
        deploymentName: (_d = (_c = args.deploymentName) !== null && _c !== void 0 ? _c : config.deploymentName) !== null && _d !== void 0 ? _d : answers.deploymentName,
        deployerPrivateKey: (_f = (_e = args.deployerPrivateKey) !== null && _e !== void 0 ? _e : config.deployerPrivateKey) !== null && _f !== void 0 ? _f : answers.netlifyPersonalToken,
        deployClient: (_h = (_g = args.deployClient) !== null && _g !== void 0 ? _g : config.deployClient) !== null && _h !== void 0 ? _h : answers.deployClient,
        netlifySlug: (_k = (_j = args.netlifySlug) !== null && _j !== void 0 ? _j : config.netlifySlug) !== null && _k !== void 0 ? _k : answers.netlifySlug,
        clientUrl: (_m = (_l = args.clientUrl) !== null && _l !== void 0 ? _l : config.clientUrl) !== null && _m !== void 0 ? _m : answers.clientUrl,
        netlifyPersonalToken: (_p = (_o = args.netlifyPersonalToken) !== null && _o !== void 0 ? _o : config.netlifyPersonalToken) !== null && _p !== void 0 ? _p : answers.netlifyPersonalToken,
    };
});
const deploy = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { default: chalk } = yield importChalk;
    const { execa } = yield importExeca;
    console.log();
    console.log(chalk.yellow(`>> Deploying ${chalk.bgYellow.black.bold(" " + options.deploymentName + " ")} <<`));
    const wallet = new ethers_1.ethers.Wallet(options.deployerPrivateKey);
    console.log(chalk.red(`>> Deployer address: ${chalk.bgYellow.black.bold(" " + wallet.address + " ")} <<`));
    console.log();
    const network = exports.SUPPORTED_DEPLOYMENT_CHAINS[options.chainId];
    const logger = new listr2_1.Logger({ useIcons: true });
    const { NetlifyAPI: netlify } = yield importNetlify;
    const netlifyAPI = options.deployClient && new netlify(options.netlifyPersonalToken);
    const id = (0, uuid_1.v4)().substring(0, 6);
    let gameContractAddress = undefined;
    let gameClientUrl = undefined;
    try {
        const tasks = new listr2_1.Listr([
            {
                title: "Deploying",
                task: () => {
                    return new listr2_1.Listr([
                        {
                            title: "Contracts",
                            task: (ctx, task) => __awaiter(void 0, void 0, void 0, function* () {
                                var _a;
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
                                (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.pipe(task.stdout());
                                const { stdout } = yield child;
                                const lines = stdout.split("\n");
                                gameContractAddress = (0, exports.findGameContractAddress)(lines);
                                ctx.gameContractAddress = gameContractAddress;
                                task.output = chalk.yellow(`Game deployed at: ${chalk.bgYellow.black(gameContractAddress)} on chain: ${chalk.bgYellow.black(network.name)}`);
                            }),
                            options: { bottomBar: 3 },
                        },
                        {
                            title: "Client",
                            task: () => {
                                return new listr2_1.Listr([
                                    {
                                        title: "Building",
                                        task: (_, task) => __awaiter(void 0, void 0, void 0, function* () {
                                            const time = Date.now();
                                            task.output = "Building local client...";
                                            const child = execa("yarn", ["workspace", "client", "build"]);
                                            yield child;
                                            const duration = Date.now() - time;
                                            task.output = "Client built in " + Math.round(duration / 1000) + "s";
                                        }),
                                        skip: () => !options.deployClient,
                                        options: { bottomBar: 3 },
                                    },
                                    {
                                        title: "Creating",
                                        task: (ctx, task) => __awaiter(void 0, void 0, void 0, function* () {
                                            const site = yield netlifyAPI.createSite({
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
                                        }),
                                        skip: () => !options.deployClient,
                                        options: { bottomBar: 1 },
                                    },
                                    {
                                        title: "Deploying",
                                        task: (ctx, task) => __awaiter(void 0, void 0, void 0, function* () {
                                            var _a;
                                            const child = execa("yarn", ["workspace", "client", "run", "netlify", "deploy", "--prod"], {
                                                env: {
                                                    NETLIFY_AUTH_TOKEN: options.netlifyPersonalToken,
                                                    NETLIFY_SITE_ID: ctx.siteId,
                                                },
                                            });
                                            (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.pipe(task.stdout());
                                            yield child;
                                            task.output = chalk.yellow("Netlify site deployed!");
                                        }),
                                        skip: () => !options.deployClient,
                                        options: { bottomBar: 3 },
                                    },
                                ], { concurrent: false });
                            },
                        },
                        {
                            title: "Redirect to Lattice Launcher",
                            task: (ctx) => __awaiter(void 0, void 0, void 0, function* () {
                                const gameContractAddress = ctx.gameContractAddress;
                                const clientUrl = options.deployClient ? ctx.clientUrl : options.clientUrl;
                                const deepLinkURI = `lattice://deployFromCLI?gameContractAddress=${gameContractAddress}&chainId=${options.chainId}&clientUrl=${clientUrl}&name=${options.deploymentName}`;
                                openurl_1.default.open(deepLinkURI);
                            }),
                            options: { bottomBar: 3 },
                        },
                    ], { concurrent: false });
                },
            },
        ]);
        yield tasks.run();
        console.log();
        console.log(chalk.bgGreen.black.bold(" Congratulations! Deployment successful"));
        console.log();
        console.log(chalk.green(`Game contract deployed to ${gameContractAddress}`));
        console.log(chalk.green(`Game client deployed to ${gameClientUrl}`));
        console.log();
    }
    catch (e) {
        logger.fail(e.message);
    }
    (0, process_1.exit)(0);
});
exports.deploy = deploy;
