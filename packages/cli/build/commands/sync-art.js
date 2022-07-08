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
exports.command = "sync-art <repo>";
exports.desc = "Syncs art from a MUD-compatible art repo, found in <repo>";
const builder = (yargs) => yargs.positional("repo", { type: "string", demandOption: true }).options({
    commitHash: { type: "string" },
});
exports.builder = builder;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    const { repo, commitHash } = argv;
    console.log("Syncing art repo from", repo);
    const clean = yield (0, utils_1.exec)(`git diff --quiet --exit-code`);
    if (!clean) {
        console.log("Directory is not clean! Please git add and commit");
        process.exit(0);
    }
    console.log("Cloning...");
    yield (0, utils_1.exec)(`git clone ${repo} _artmudtemp`);
    if (commitHash) {
        yield (0, utils_1.exec)(`cd _artmudtemp && git reset --hard ${commitHash} && cd -`);
    }
    console.log("Moving atlases...");
    yield (0, utils_1.exec)(`cp -r _artmudtemp/atlases src/public`);
    console.log("Moving tilesets...");
    yield (0, utils_1.exec)(`cp -r _artmudtemp/tilesets src/layers/Renderer/assets`);
    console.log("Moving tileset types...");
    yield (0, utils_1.exec)(`cp -r _artmudtemp/types/ src/layers/Renderer/Phaser/tilesets/`);
    console.log("Cleaning up...");
    yield (0, utils_1.exec)(`rm -rf _artmudtemp`);
    console.log("Committing...");
    yield (0, utils_1.exec)(`git add src/public && git add src/layers/Renderer && git commit -m "Adding art from ${repo}${commitHash ? " with hash " + commitHash : ""}"`);
    process.exit(0);
});
exports.handler = handler;
