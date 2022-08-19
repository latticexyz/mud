package main

import (
	"flag"
	"math/big"

	"go.uber.org/zap"

	"latticexyz/chain-sidecar/pkg/eth"
	"latticexyz/chain-sidecar/pkg/grpc"
	"latticexyz/chain-sidecar/pkg/logger"
	"latticexyz/chain-sidecar/pkg/snapshot"
	"latticexyz/chain-sidecar/pkg/utils"
)

var (
	wsUrl          = flag.String("ws-url", "ws://localhost:8545", "Websocket Url")
	port           = flag.Int("port", 50051, "gRPC Server Port")
	worldAddresses = flag.String("worldAdresses", "", "List of world addresses to index ECS state for. Defaults to empty string which will listen for all world events from all addresses")
)

func main() {
	// Parse command line flags.
	flag.Parse()

	// Setup logging.
	logger.InitLogger()
	logger := logger.GetLogger()
	defer logger.Sync()

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
	go grpc.StartSnapshotServer(*port, logger)

	// 1. Prepare for service to run.
	utils.EnsureDir(snapshot.SnapshotDir)

	// 2. Kick off the service to catch up on state up to the current block number.
	fromBlock := big.NewInt(0)
	toBlock := eth.GetCurrentBlockHead(ethclient)

	initialState := snapshot.Sync(ethclient, fromBlock, toBlock, worlds)

	// 3. Kick off the service to start syncing with new block heads from the current one.
	snapshot.Start(initialState, ethclient, fromBlock, worlds, logger)
}
