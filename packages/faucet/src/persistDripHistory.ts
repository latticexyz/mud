import { writeFile } from "fs";
import { DripHistory } from "./common";

export type PersistDripHistoryParams = { dripHistory: DripHistory; dripHistoryPath: string };

export async function persistDripHistory({ dripHistory, dripHistoryPath }: PersistDripHistoryParams): Promise<void> {
  return new Promise((resolve, reject) =>
    writeFile(dripHistoryPath, JSON.stringify(dripHistory), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }),
  );
}

// TODO: load drip history
// TODO: getDrips
// TODO: getLastDripTimestamp
// TODO: persist drip history in regular intervals and before exit
