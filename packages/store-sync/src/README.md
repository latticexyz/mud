# Approach

#### If pending logs are not available

- Initialize snapshot
- Initialize log stream from latest block
  - Catch up logs between snapshot and latest block
  - Attempt to stream logs from indexer
  - On failure, fallback to streaming logs from RPC
- Release initial, catchup and ongoing stream to subscribers

#### If pending logs are available

- Initialize from snapshot
- Open a pending log stream
  - On error recreate the stream
- Open a fallback log stream (indexer or RPC)
- Catch up logs between snapshot and latest block
- Cache processed log indices from pending logs stream
- On every new block from the fallback logs stream
  - Verify that all logs have already been processed in the pending logs stream
  - If missing logs are found, release the missing logs to subscribers and recreate the pending logs stream
