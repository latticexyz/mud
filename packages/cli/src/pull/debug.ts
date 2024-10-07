import { debug as parentDebug } from "../debug";

export const debug = parentDebug.extend("pull");
export const error = parentDebug.extend("pull");

// Pipe debug output to stdout instead of stderr
debug.log = console.debug.bind(console);

// Pipe error output to stderr
error.log = console.error.bind(console);
