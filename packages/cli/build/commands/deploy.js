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
exports.deploy = exports.handler = exports.builder = exports.desc = exports.command = void 0;
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
// Workaround to prevent tsc to transpile dynamic imports with require, which causes an error upstream
// https://github.com/microsoft/TypeScript/issues/43329#issuecomment-922544562
const importNetlify = eval('import("netlify")');
const importChalk = eval('import("chalk")');
const importExeca = eval('import("execa")');
const importFetch = eval('import("node-fetch")');
exports.command = "deploy";
exports.desc = "Deploys the local mud contracts and optionally the client";
const builder = (yargs) => yargs.options({
    i: { type: "boolean" },
    chainSpec: { type: "string" },
    chainId: { type: "number" },
    rpc: { type: "string" },
    personaMirror: { type: "string" },
    persona: { type: "string" },
    personaAllMinter: { type: "string" },
    world: { type: "string" },
    diamond: { type: "string" },
    reuseComponents: { type: "boolean" },
    deployerPrivateKey: { type: "string" },
    deployClient: { type: "boolean" },
    clientUrl: { type: "string" },
    netlifySlug: { type: "string" },
    netlifyPersonalToken: { type: "string" },
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
function findLog(deployLogLines, log) {
    for (const logLine of deployLogLines) {
        if (logLine.includes(log)) {
            return logLine.split(log)[1].trim();
        }
    }
    throw new Error("Can not find log");
}
const getDeployInfo = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17;
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
    const defaultOptions = {
        chainSpec: "chainSpec.json",
        chainId: 31337,
        rpc: "http://localhost:8545",
        reuseComponents: false,
        deployClient: false,
        clientUrl: "http://localhost:3000",
    };
    const answers = args.i
        ? yield inquirer_1.default.prompt([
            {
                type: "input",
                name: "chainSpec",
                default: defaultOptions.chainSpec,
                message: "Provide a chainSpec.json location (local or remote)",
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
                name: "rpc",
                default: defaultOptions.rpc,
                message: "Provide a JSON RPC endpoint for your deployment",
                when: (answers) => answers.chainSpec == null && args.rpc == null && config.rpc == null,
                validate: (i) => {
                    if (isValidHttpUrl(i))
                        return true;
                    return "Invalid URL";
                },
            },
            {
                type: "input",
                name: "personaMirror",
                message: "Provide the address of an existing PersonaMirror contract. (If none is given, PersonaMirror will be deployed.)",
                when: (answers) => answers.chainSpec == null && args.personaMirror == null && config.personaMirror == null,
                validate: (i) => {
                    if (!i || (i[0] == "0" && i[1] == "x" && i.length === 42))
                        return true;
                    return "Invalid address";
                },
            },
            {
                type: "input",
                name: "persona",
                message: "Provide the address of an existing Persona contract. (If none is given, Persona will be deployed.)",
                when: (answers) => answers.chainSpec == null && args.persona == null && config.persona == null,
                validate: (i) => {
                    if (!i || (i[0] == "0" && i[1] == "x" && i.length === 42))
                        return true;
                    return "Invalid address";
                },
            },
            {
                type: "input",
                name: "personaAllMinter",
                message: "Provide the address of an existing PersonaAllMinter contract. (If none is given, PersonaAllMinter will be deployed.)",
                when: (answers) => answers.chainSpec == null && args.persona == null && config.persona == null,
                validate: (i) => {
                    if (!i || (i[0] == "0" && i[1] == "x" && i.length === 42))
                        return true;
                    return "Invalid address";
                },
            },
            {
                type: "input",
                name: "diamond",
                message: "Provide the address of an existing Diamond contract that should be updated. (If none is given, a new Diamond will be deployed.)",
                when: () => args.diamond == null && config.diamond == null,
                validate: (i) => {
                    if (!i || (i[0] == "0" && i[1] == "x" && i.length === 42))
                        return true;
                    return "Invalid address";
                },
            },
            {
                type: "input",
                name: "world",
                message: "Provide the address of an existing World contract. (If none is given, a new World will be deployed.)",
                when: () => args.world == null && config.world == null,
                validate: (i) => {
                    if (!i || (i[0] == "0" && i[1] == "x" && i.length === 42))
                        return true;
                    return "Invalid address";
                },
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
                when: () => args.reuseComponents == null && config.reuseComponents == null,
            },
            {
                type: "input",
                name: "deployerPrivateKey",
                message: "Enter private key of the deployer account:",
                when: () => !args.deployerPrivateKey && !config.deployerPrivateKey,
                validate: (i) => {
                    if (i[0] == "0" && i[1] == "x" && i.length === 66)
                        return true;
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
                choices: (answers) => __awaiter(void 0, void 0, void 0, function* () {
                    var _18, _19;
                    return yield getNetlifyAccounts((_19 = (_18 = args.netlifyPersonalToken) !== null && _18 !== void 0 ? _18 : config.netlifyPersonalToken) !== null && _19 !== void 0 ? _19 : answers.netlifyPersonalToken);
                }),
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
                    }
                    else {
                        return "Not a valid URL";
                    }
                },
            },
        ])
        : {};
    const { default: fetch } = yield importFetch;
    const chainSpecUrl = (_b = (_a = args.chainSpec) !== null && _a !== void 0 ? _a : config.chainSpec) !== null && _b !== void 0 ? _b : answers.chainSpec;
    const chainSpec = chainSpecUrl == null
        ? null
        : isValidHttpUrl(chainSpecUrl)
            ? yield (yield fetch(chainSpecUrl)).json()
            : JSON.parse(fs_1.default.readFileSync(chainSpecUrl, "utf8"));
    // Priority of config source: command line args >> chainSpec >> local config >> interactive answers >> defaults
    // -> Command line args can override every other config, interactive questions are only asked if no other config given for this option
    return {
        chainSpec: (_e = (_d = (_c = args.chainSpec) !== null && _c !== void 0 ? _c : config.chainSpec) !== null && _d !== void 0 ? _d : answers.chainSpec) !== null && _e !== void 0 ? _e : defaultOptions.chainSpec,
        chainId: (_j = (_h = (_g = (_f = args.chainId) !== null && _f !== void 0 ? _f : chainSpec === null || chainSpec === void 0 ? void 0 : chainSpec.chainId) !== null && _g !== void 0 ? _g : config.chainId) !== null && _h !== void 0 ? _h : answers.chainId) !== null && _j !== void 0 ? _j : defaultOptions.chainId,
        rpc: (_o = (_m = (_l = (_k = args.rpc) !== null && _k !== void 0 ? _k : chainSpec === null || chainSpec === void 0 ? void 0 : chainSpec.rpc) !== null && _l !== void 0 ? _l : config.rpc) !== null && _m !== void 0 ? _m : answers.rpc) !== null && _o !== void 0 ? _o : defaultOptions.rpc,
        personaMirror: (_r = (_q = (_p = args.personaMirror) !== null && _p !== void 0 ? _p : chainSpec === null || chainSpec === void 0 ? void 0 : chainSpec.personaMirrorAddress) !== null && _q !== void 0 ? _q : config.personaMirror) !== null && _r !== void 0 ? _r : answers.personaMirror,
        personaAllMinter: (_u = (_t = (_s = args.personaAllMinter) !== null && _s !== void 0 ? _s : chainSpec === null || chainSpec === void 0 ? void 0 : chainSpec.personaAllMinterAddress) !== null && _t !== void 0 ? _t : config.personaAllMinter) !== null && _u !== void 0 ? _u : answers.personaAllMinter,
        persona: (_x = (_w = (_v = args.persona) !== null && _v !== void 0 ? _v : chainSpec === null || chainSpec === void 0 ? void 0 : chainSpec.personaAddress) !== null && _w !== void 0 ? _w : config.persona) !== null && _x !== void 0 ? _x : answers.persona,
        world: (_0 = (_z = (_y = args.world) !== null && _y !== void 0 ? _y : chainSpec === null || chainSpec === void 0 ? void 0 : chainSpec.world) !== null && _z !== void 0 ? _z : config.world) !== null && _0 !== void 0 ? _0 : answers.world,
        diamond: (_2 = (_1 = args.diamond) !== null && _1 !== void 0 ? _1 : config.diamond) !== null && _2 !== void 0 ? _2 : answers.diamond,
        reuseComponents: (_5 = (_4 = (_3 = args.reuseComponents) !== null && _3 !== void 0 ? _3 : config.reuseComponents) !== null && _4 !== void 0 ? _4 : answers.reuseComponents) !== null && _5 !== void 0 ? _5 : defaultOptions.reuseComponents,
        deployerPrivateKey: (_7 = (_6 = args.deployerPrivateKey) !== null && _6 !== void 0 ? _6 : config.deployerPrivateKey) !== null && _7 !== void 0 ? _7 : answers.deployerPrivateKey,
        deployClient: (_10 = (_9 = (_8 = args.deployClient) !== null && _8 !== void 0 ? _8 : config.deployClient) !== null && _9 !== void 0 ? _9 : answers.deployClient) !== null && _10 !== void 0 ? _10 : defaultOptions.deployClient,
        clientUrl: (_13 = (_12 = (_11 = args.clientUrl) !== null && _11 !== void 0 ? _11 : config.clientUrl) !== null && _12 !== void 0 ? _12 : answers.clientUrl) !== null && _13 !== void 0 ? _13 : defaultOptions.clientUrl,
        netlifySlug: (_15 = (_14 = args.netlifySlug) !== null && _14 !== void 0 ? _14 : config.netlifySlug) !== null && _15 !== void 0 ? _15 : answers.netlifySlug,
        netlifyPersonalToken: (_17 = (_16 = args.netlifyPersonalToken) !== null && _16 !== void 0 ? _16 : config.netlifyPersonalToken) !== null && _17 !== void 0 ? _17 : answers.netlifyPersonalToken,
    };
});
const deploy = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const { default: chalk } = yield importChalk;
    const { execa } = yield importExeca;
    console.log();
    console.log(chalk.yellow(`>> Deploying contracts <<`));
    console.log("Options");
    console.log(options);
    const wallet = new ethers_1.ethers.Wallet(options.deployerPrivateKey);
    console.log(chalk.red(`>> Deployer address: ${chalk.bgYellow.black.bold(" " + wallet.address + " ")} <<`));
    console.log();
    const logger = new listr2_1.Logger({ useIcons: true });
    const { NetlifyAPI: netlify } = yield importNetlify;
    const netlifyAPI = options.deployClient && new netlify(options.netlifyPersonalToken);
    const id = (0, uuid_1.v4)().substring(0, 6);
    let launcherUrl;
    let gameContractAddress;
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
                                    "deployEmber(address,address,address,address,bool)",
                                    wallet.address,
                                    options.personaMirror || ethers_1.constants.AddressZero,
                                    options.diamond || ethers_1.constants.AddressZero,
                                    options.world || ethers_1.constants.AddressZero,
                                    options.reuseComponents ? "true" : "false",
                                    "--fork-url",
                                    options.rpc,
                                ]);
                                (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.pipe(task.stdout());
                                const { stdout } = yield child;
                                const lines = stdout.split("\n");
                                ctx.gameContractAddress = gameContractAddress = findLog(lines, "diamond: address");
                                ctx.personaMirrorAddress = findLog(lines, "personaMirror: address");
                                task.output = chalk.yellow(`Game deployed at: ${chalk.bgYellow.black(ctx.gameContractAddress)}`);
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
                                            const child = execa("yarn", ["workspace", "ri-client", "build"]);
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
                                                    name: `mud-deployment-${wallet.address.substring(2, 8)}-${id}`,
                                                    account_slug: options.netlifySlug,
                                                    ssl: true,
                                                    force_ssl: true,
                                                },
                                            });
                                            ctx.siteId = site.id;
                                            ctx.clientUrl = site.ssl_url;
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
                            title: "Open Launcher",
                            task: (ctx) => __awaiter(void 0, void 0, void 0, function* () {
                                const clientUrl = options.deployClient ? ctx.clientUrl : options.clientUrl;
                                launcherUrl = `https://play.lattice.xyz?address=${ctx.gameContractAddress || ""}&personaMirrorAddress=${ctx.personaMirrorAddress || ""}&personaAddress=${options.persona || ""}&personaAllMinter=${options.personaAllMinter || ""}&client=${clientUrl || ""}&rpc=${options.rpc || ""}&chainId=${options.chainId || ""}`;
                                openurl_1.default.open(launcherUrl);
                            }),
                            options: { bottomBar: 3 },
                        },
                    ], { concurrent: false });
                },
            },
        ]);
        yield tasks.run();
        console.log(chalk.bgGreen.black.bold(" Congratulations! Deployment successful"));
        console.log();
        console.log(chalk.green(`Contract deployed to ${gameContractAddress}`));
        console.log(chalk.green(`Open launcher at ${launcherUrl}`));
        console.log();
    }
    catch (e) {
        logger.fail(e.message);
    }
    (0, process_1.exit)(0);
});
exports.deploy = deploy;
