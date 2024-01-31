import createDebug from "debug";

export const debug = createDebug("abi-ts");
export const error = createDebug("abi-ts");

// Pipe debug output to stdout instead of stderr
debug.log = console.debug.bind(console);

// Pipe error output to stderr
error.log = console.error.bind(console);
