package snapshot

import (
	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/logger"
	"math"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

func Sync(client *ethclient.Client, fromBlock *big.Int, toBlock *big.Int, worldAddresses []common.Address) ChainECSState {
	logger := logger.GetLogger()
	logger.Info("starting initial sync",
		zap.String("category", "Initial sync"),
		zap.Uint64("upToBlock", toBlock.Uint64()),
	)

	state, loadedFromBlockNumber := getInitialStateChain()
	if loadedFromBlockNumber < math.MaxUint64 {
		logger.Info("loaded initial state from snapshot",
			zap.String("category", "Initial sync"),
			zap.Uint64("loadedFromBlockNumber (min from all worlds)", loadedFromBlockNumber),
		)
	}

	// Default to sync from whatever the start block is, then update if we were able to sync from an existing snapshot.
	blockToStartSyncFrom := fromBlock.Int64()
	if loadedFromBlockNumber < math.MaxUint64 {
		blockToStartSyncFrom = int64(loadedFromBlockNumber)
	}

	for block := blockToStartSyncFrom; block < toBlock.Int64(); block += InitialSyncBlockBatchSize {
		state = processEventBatch(client, state, big.NewInt(block), big.NewInt(block+InitialSyncBlockBatchSize), worldAddresses)
		// Wait some time in-between batch requests. Note that with large enough numbers of events being batch processed,
		// this wait time becomes negligable compared to the log load / parse.
		time.Sleep(InitialSyncBlockBatchSyncTimeout)
		// Take an in-progress snapshot up to the block number that has so far been loaded.
		if block%InitialSyncSnapshotInterval == 0 {
			go takeStateSnapshotChain(state, uint64(block), uint64(block+InitialSyncBlockBatchSize), Latest)
		}
	}

	logger.Info("finished sync",
		zap.String("category", "Initial sync"),
		zap.Uint64("fromBlock", fromBlock.Uint64()),
		zap.Uint64("toBlock", toBlock.Uint64()),
	)

	// Once the state is reduced, create a snapshot on disk which will later be merged with the
	// up-to-date state.
	go takeStateSnapshotChain(state, fromBlock.Uint64(), toBlock.Uint64(), InitialSync)

	return state
}

func processEventBatch(client *ethclient.Client, state ChainECSState, startBlock *big.Int, endBlock *big.Int, worldAddresses []common.Address) ChainECSState {
	// Fetch all events in the batch range.
	logger := logger.GetLogger()
	logger.Info("fetching events",
		zap.String("category", "Initial sync"),
		zap.Uint64("startBlock", startBlock.Uint64()),
		zap.Uint64("endBlock", endBlock.Uint64()),
	)

	logs, err := eth.GetAllEventsInRange(client, startBlock, endBlock, worldAddresses)
	if err != nil {
		logger.Fatal("failed to fetch events to catch up on",
			zap.Error(err),
		)
	}
	logger.Info("catching up on events", zap.String("category", "Initial sync"), zap.Int("numEvents", len(logs)))

	// Filter the logs.
	filteredLogs := eth.FilterLogs(logs)
	// Reduce the logs into what the state is now.
	state = reduceLogsIntoState(state, filteredLogs)
	return state
}
