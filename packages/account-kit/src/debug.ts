import createDebug from "debug";

export const debug = createDebug("mud:account-kit");
export const error = createDebug("mud:account-kit");

debug.log = console.debug.bind(console);
error.log = console.error.bind(console);
