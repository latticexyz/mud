// import createDebug from "debug";
// export const debug = createDebug("mud:id");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const debug = (...args: any[]) => console.log("[mud id]", ...args);
