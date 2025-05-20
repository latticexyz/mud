# Approach

#### If wiresaw is not available

- Initialize snapshot
- Initialize log stream from latest block
  - Catch up logs between snapshot and latest block
  - Attempt to stream logs from indexer
  - On failure, fallback to streaming logs from RPC
- Release initial, catchup and ongoing stream to subscribers

#### If wiresaw is available

- Initialize from snapshot
- Open a log stream from wiresaw
  - on error recreate the stream
- Open a fallback log stream (indexer or RPC)
- Catch up logs between snapshot and latest block
- Cache identifiers for the logs received from wiresaw
- On every new block from the fallback stream
  - verify that all logs have already been processed from wiresaw
  - if missing logs are found, submit the missing logs to subscribers
  - TODO: if a log is missing, print a warning in the console to open a bug report
  - TODO: can we make sure that the next pending logs are only released once the latest blocks stream catches up?
