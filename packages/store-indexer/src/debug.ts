import createDebug from "debug";

export const debug = createDebug("mud:store-indexer");
export const error = createDebug("mud:store-indexer");

// Pipe debug output to stdout instead of stderr
debug.log = console.debug.bind(console);

// Pipe error output to stderr
error.log = console.error.bind(console);
