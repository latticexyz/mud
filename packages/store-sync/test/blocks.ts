import worldRpcLogs from "../../../test-data/world-logs.json";
import { logsToBlocks } from "./logsToBlocks";

// TODO: make test-data a proper package and export this
export const blocks = logsToBlocks(worldRpcLogs);
