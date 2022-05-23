import { JsonRpcProvider } from "@ethersproject/providers";
import { filterNullish } from "@mudkit/utils";
import { DoWork, runWorker } from "observable-webworker";
import { Observable, of } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { ContractAddressInterface, ContractsEventStreamConfig } from "./types";
import { ContractEvent } from "./types";
import { Contracts } from "./types";
import { fetchEventsInBlockRange } from "./networkUtils";

export type Input<C extends Contracts> = [
  [ContractAddressInterface<C>, ContractsEventStreamConfig<C>, number],
  string,
  boolean
];

export type Output<C extends Contracts> = ContractEvent<C>;

export class SyncWorker<C extends Contracts> implements DoWork<Input<C>, Output<C>> {
  private lastSyncedBlockNumber: number | undefined;
  private provider: JsonRpcProvider | undefined;
  private providerUrl: string | undefined;
  public work(input$: Observable<Input<C>>): Observable<Output<C>> {
    return input$.pipe(
      map(([[contracts, config, blockNumber], providerUrl, supportsBatchQueries]) => {
        // The first number in the stream is used to set the initial lastSyncedBlockNumber
        if (this.lastSyncedBlockNumber == undefined) {
          this.lastSyncedBlockNumber = blockNumber;
          return;
        }

        if (this.provider == undefined || this.providerUrl == undefined || this.providerUrl !== providerUrl) {
          this.providerUrl = providerUrl;
          this.provider = new JsonRpcProvider(providerUrl);
        }

        const events = fetchEventsInBlockRange(
          this.provider,
          config.contractTopics,
          this.lastSyncedBlockNumber + 1,
          blockNumber,
          contracts,
          supportsBatchQueries
        );

        this.lastSyncedBlockNumber = blockNumber;
        return events;
      }),
      filterNullish(),
      concatMap((i) => i),
      // we flatten the stream into a stream of ContractEvent
      map((v) => of(...v)),
      concatMap((v) => v)
    );
  }
}

runWorker(SyncWorker);
