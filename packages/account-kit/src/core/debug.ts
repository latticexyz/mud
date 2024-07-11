import { debug as parentDebug, error as parentError } from "../debug";

export const debug = parentDebug.extend("core");
export const error = parentError.extend("core");
