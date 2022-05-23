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
exports.desc = "Sets up a fresh mud project into <name>";
const builder = (yargs) => yargs.positional("name", { type: "string", demandOption: true });
exports.builder = builder;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = argv;
    console.log("Creating new mud project in", name);
    console.log("Cloning...");
    yield (0, utils_1.exec)(`git clone https://github.com/latticexyz/mud _mudtemp`);
    console.log("Done cloning");
    console.log("Moving...");
    yield (0, utils_1.exec)(`cp -r _mudtemp/packages/ri ${name}`);
    console.log("Done moving");
    console.log("Cleaning up...");
    yield (0, utils_1.exec)(`rm -rf _mudtemp`);
    console.log("Done cleaning up");
    process.exit(0);
});
exports.handler = handler;
