import createDebug from "debug";

export const debug = createDebug("mud:world");
debug.log = console.debug.bind(console);

export const error = createDebug("mud:world");
error.log = console.error.bind(console);
