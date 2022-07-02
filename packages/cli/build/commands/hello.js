"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
exports.command = "hello <name>";
exports.desc = "Greet <name> with Hello";
const builder = (yargs) => yargs
    .options({
    upper: { type: "boolean" },
})
    .positional("name", { type: "string", demandOption: true });
exports.builder = builder;
const handler = (argv) => {
    const { name } = argv;
    const greeting = `Gm, ${name}!`;
    console.log(greeting);
    process.exit(0);
};
exports.handler = handler;
