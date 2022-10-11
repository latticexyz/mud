/*
ecs-snapshot computes and saves ECS state from a chain via snapshots, such that the client can
perform an initial sync to the ECS world state without having to process all ECS state changes
in form of events.

It exposes a [pkg.grpc.StartSnapshotServer] for getting the snapshot data and a gRPC-web HTTP server
wrapper to allow clients which are web applications to request snapshots with a POST request.

By default, ecs-snapshot attempts to connect to a local development chain and also by default,
ecs-snapshot indexes and snapshots all ECS state it finds via emitted events, which can be
restricted by specifying contract addresses.

Usage:

    ecs-snapshot [flags]

The flags are:

    -ws-url
        Websocket URL for chain to index and snapshot.
    -port
        Port to expose the gRPC server.
	-worldAddresses
		Comma-separated list of contract addresses to limit the indexing to. If left blank, index
		everything, otherwise, use this list as a filter.

*/
package main

import (
	"flag"
	"math/big"
	"time"

	"go.uber.org/zap"

	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/snapshot"
	"latticexyz/mud/packages/services/pkg/utils"
)

var (
	wsUrl                            = flag.String("ws-url", "ws://localhost:8545", "Websocket Url")
	port                             = flag.Int("port", 50061, "gRPC Server Port")
	worldAddresses                   = flag.String("worldAddresses", "", "List of world addresses to index ECS state for. Defaults to empty string which will listen for all world events from all addresses")
	block                            = flag.Int64("block", 0, "Block to start taking snapshots from. Defaults to 0")
	snapshotBlockInterval            = flag.Int64("snapshot-block-interval", 100, "Block number interval for how often to take regular snapshots")
	initialSyncBlockBatchSize        = flag.Int64("initial-sync-block-batch-size", 10, "Number of blocks to fetch data for when performing an initial sync")
	initialSyncBlockBatchSyncTimeout = flag.Int64("initial-sync-block-batch-sync-timeout", 100, "Time in milliseconds to wait between calls to fetch batched log data when performing an initial sync")
	initialSyncSnapshotInterval      = flag.Int64("initial-sync-snapshot-interval", 5000, "Block number interval for how often to take intermediary snapshots when performing an initial sync")
	metricsPort                      = flag.Int("metrics-port", 6060, "Prometheus metrics http handler port. Defaults to port 6060")
)

func main() {
	// Parse command line flags.
	flag.Parse()

	// Setup logging.
	logger.InitLogger()
	logger := logger.GetLogger()
	defer logger.Sync()

	// Build a config.
	config := &snapshot.SnapshotServerConfig{
		SnapshotBlockInterval:            *snapshotBlockInterval,
		InitialSyncBlockBatchSize:        *initialSyncBlockBatchSize,
		InitialSyncBlockBatchSyncTimeout: time.Duration(*initialSyncBlockBatchSyncTimeout) * time.Millisecond,
		InitialSyncSnapshotInterval:      *initialSyncSnapshotInterval,
	}

	// Parse world addresses to listen to.
	worlds := utils.SplitAddressList(*worldAddresses, ",")
	if len(worlds) == 0 {
		logger.Info("listening for events from all world addresses")
	} else {
		logger.Info("listening for events from specific addresses", zap.String("worldAddresses", *worldAddresses))
	}

	// Get an instance of ethereum client.
	ethclient := eth.GetEthereumClient(*wsUrl, logger)

	// Start gRPC server.
	go grpc.StartSnapshotServer(*port, *metricsPort, config, logger)

	// 1. Prepare for service to run.
	utils.EnsureDir(snapshot.SnapshotDir)

	// 2. Kick off the service to catch up on state up to the current block number.
	fromBlock := big.NewInt(*block)
	toBlock := eth.GetCurrentBlockHead(ethclient)

	initialState := snapshot.Sync(ethclient, fromBlock, toBlock, worlds, config)

	// 3. Kick off the service to start syncing with new block heads from the current one.
	snapshot.Start(initialState, ethclient, fromBlock, worlds, config, logger)
}
