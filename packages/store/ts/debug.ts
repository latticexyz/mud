import createDebug from "debug";

export const debug = createDebug("mud:store");
debug.log = console.debug.bind(console);

export const error = createDebug("mud:store");
error.log = console.error.bind(console);
