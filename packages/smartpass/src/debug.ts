import createDebug from "debug";

// export const debug = createDebug("mud:smartpass");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debug = (...args: any[]) => console.log(...args);
