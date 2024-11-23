import createDebug from "debug";

export const debug = createDebug("mud:entrykit");
export const error = createDebug("mud:entrykit");

// Pipe debug output to stdout instead of stderr
debug.log = console.debug.bind(console);

// Pipe error output to stderr
error.log = console.error.bind(console);
