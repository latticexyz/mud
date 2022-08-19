package snapshot

import "time"

const SnapshotDir string = "snapshots"
const SerializedStateFilename string = "./snapshots/SerializedECSState"
const SerializedWorldsFilename string = "./snapshots/SerializedWorlds"

// How often to take regular snapshots.
const SnapshotBlockInterval int64 = 100

// Initial sync.
const InitialSyncBlockBatchSize int64 = 10
const InitialSyncBlockBatchSyncTimeout = 100 * time.Millisecond
const InitialSyncSnapshotInterval int64 = 5000
