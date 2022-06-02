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
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const utils_1 = require("../utils");
exports.command = "create <name>";
exports.desc = "Sets up a fresh mud project into <name>. Requires yarn.";
const builder = (yargs) => yargs.positional("name", { type: "string", demandOption: true });
exports.builder = builder;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = argv;
    console.log("Creating new mud project in", name);
    console.log("Cloning...");
    yield (0, utils_1.exec)(`git clone https://github.com/latticexyz/mud _mudtemp`);
    console.log("Moving...");
    yield (0, utils_1.exec)(`cp -r _mudtemp/packages/ri ${name}`);
    console.log("Setting up vscode solidity settings...");
    yield (0, utils_1.exec)(`cp -r _mudtemp/.vscode ${name}/.vscode`);
    console.log("Cleaning up...");
    yield (0, utils_1.exec)(`rm -rf _mudtemp`);
    console.log("Setting up package.json...");
    yield (0, utils_1.exec)(`mv ${name}/packagejson.template ${name}/package.json`);
    console.log("Installing dependencies using yarn...");
    yield (0, utils_1.exec)(`cd ${name} && yarn install`);
    console.log("Setting up foundry.toml...");
    yield (0, utils_1.exec)(`rm ${name}/contracts/foundry.toml`);
    yield (0, utils_1.exec)(`mv ${name}/contracts/foundrytoml.template ${name}/contracts/foundry.toml`);
    console.log("Setting up remappings...");
    yield (0, utils_1.exec)(`rm ${name}/contracts/remappings.txt`);
    yield (0, utils_1.exec)(`mv ${name}/contracts/remappingstxt.template ${name}/contracts/remappings.txt`);
    console.log("Setting up compile task...");
    yield (0, utils_1.exec)(`rm ${name}/contracts/tasks/compile.ts`);
    yield (0, utils_1.exec)(`mv ${name}/contracts/tasks/compilets.template ${name}/contracts/tasks/compile.ts`);
    console.log("Building contracts...");
    yield (0, utils_1.exec)(`cd ${name}/contracts && yarn build`);
    console.log("Done setting up! Run `yarn start` to start client and chain, then head to localhost:3000 to explore.");
    process.exit(0);
});
exports.handler = handler;
