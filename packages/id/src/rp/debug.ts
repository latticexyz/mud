// intentionally here before debug imports so debug picks up value
// TODO: replace this with some lib where we can pass debug param from parent frame
localStorage.setItem("debug", "mud:*");

import { debug as parentDebug } from "../debug";

export const debug = parentDebug.extend("rp");
