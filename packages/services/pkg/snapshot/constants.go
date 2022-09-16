package snapshot

import "time"

// SnapshotDir is the directory name for where the ECS snapshots are stored.
const SnapshotDir string = "snapshots"

// SerializedStateFilename is the name for the snapshot binary of ECS State.
const SerializedStateFilename string = "./snapshots/SerializedECSState"

// SerializedWorldsFilename is the name for the snapshot binary of Worlds.
const SerializedWorldsFilename string = "./snapshots/SerializedWorlds"

// SnapshotBlockInterval is the block number interval for how often to take regular snapshots.
const SnapshotBlockInterval int64 = 100

// InitialSyncBlockBatchSize is the number of blocks to fetch data for when performing an initial
// sync. This is limited by the bandwidth limit of Geth for fetching logs, which is a hardcoded
// constant.
const InitialSyncBlockBatchSize int64 = 10

// InitialSyncBlockBatchSyncTimeout is the time to wait between calls to fetch batched log data
// when performing an initial sync.
const InitialSyncBlockBatchSyncTimeout = 100 * time.Millisecond

// InitialSyncSnapshotInterval is the block number interval for how often to take intermediary
// snapshots when performing an initial sync. This is useful in case the snapshot service
// disconnects or fails while perfoming a lengthy initial sync.
const InitialSyncSnapshotInterval int64 = 5000
