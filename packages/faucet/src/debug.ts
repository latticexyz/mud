import createDebug from "debug";

export const debug = createDebug("mud:faucet");
export const error = createDebug("mud:faucet");

// Pipe debug output to stdout instead of stderr
debug.log = console.debug.bind(console);

// Pipe error output to stderr
error.log = console.error.bind(console);
