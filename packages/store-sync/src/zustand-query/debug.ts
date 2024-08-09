import { debug as parentDebug } from "../debug";

export const debug = parentDebug.extend("zustant-query");
export const error = parentDebug.extend("zustand-query");

// Pipe debug output to stdout instead of stderr
debug.log = console.debug.bind(console);

// Pipe error output to stderr
error.log = console.error.bind(console);
