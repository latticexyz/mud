package ingress

import (
	"context"
	"errors"
	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/config"
	"latticexyz/mud/packages/services/pkg/mode/read"
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	"latticexyz/mud/packages/services/pkg/mode/tablestore"
	"latticexyz/mud/packages/services/pkg/mode/write"
	"latticexyz/mud/packages/services/pkg/utils"
	"math/big"
	"strconv"

	"github.com/avast/retry-go"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"go.uber.org/zap"
)

// New creates a new Layer instance connected to an Ethereum execution client.
//
// Parameters:
// - chainConfig (*config.ChainConfig): The configuration for the chain to index.
// - syncConfig (*config.SyncConfig): The configuration for the syncing process.
// - wl (*write.Layer): The write Layer instance to use for writing data to the database.
// - rl (*read.Layer): The read Layer instance to use for reading data from the database.
// - tableStore (*tablestore.Store): The table Store instance to use for storing tables.
// - logger (*zap.Logger): The logger to use for logging messages.
//
// Returns:
// - (*Layer): A pointer to the new ingress Layer instance.
func New(
	chainConfig config.ChainConfig,
	syncConfig config.SyncConfig,
	wl *write.Layer,
	rl *read.Layer,
	tableStore *tablestore.Store,
	logger *zap.Logger,
) *Layer {
	logger.Info("creating ingress layer connected to websocket", zap.String("ws", chainConfig.RPC.WS))

	// Create a connection to an Ethereum execution client.
	eth := eth.GetEthereumClient(chainConfig.RPC.WS, logger)

	// Perform chain-specific actions on the write layer.
	// Create a table that stores the schemas for every table on the chain that this ingress layer is indexing.
	err := wl.CreateTable(mode.SchemasTable(chainConfig.Id))
	if err != nil {
		logger.Fatal("failed to create SchemasTable", zap.Error(err))
	}
	// Create a table that stores the current block number on the chain that this ingress layer is indexing.
	err = wl.CreateTable(mode.BlockNumberTable(chainConfig.Id))
	if err != nil {
		logger.Fatal("failed to create BlockNumberTable", zap.Error(err))
	}
	// Create a table that stores the current sync status of this ingress layer.
	err = wl.CreateTable(mode.SyncStatusTable(chainConfig.Id))
	if err != nil {
		logger.Fatal("failed to create SyncStatusTable", zap.Error(err))
	}

	return &Layer{
		eth:                      eth,
		wl:                       wl,
		rl:                       rl,
		tableStore:               tableStore,
		chainConfig:              chainConfig,
		syncConfig:               syncConfig,
		syncLogBuffer:            make([][]types.Log, 0),
		syncLogBufferBlockNumber: make([]uint64, 0),
		logger:                   logger,
	}
}

// Run starts the main loop of the IngressLayer object.
// It subscribes to block headers and processes new blocks as they arrive, parsing and filtering their logs.
// If the ingress layer is currently syncing, logs are buffered until the sync is complete.
//
// Returns:
// - void.
func (il *Layer) Run() {
	// Get an instance of a websocket subscription to the client.
	headers := make(chan *types.Header)
	sub, err := eth.GetEthereumSubscription(il.eth, headers)
	if err != nil {
		il.logger.Fatal("failed to subscribe to block headers", zap.Error(err))
	}

	// The loop is: react to block headers (new blocks) and parse each block.
	for {
		select {
		case subErr := <-sub.Err():
			il.logger.Error("failed to receive event from subscription", zap.Error(subErr))

			var retrying bool
			resubErr := retry.Do(
				func() error {
					var retryErr error
					sub, retryErr = eth.GetEthereumSubscription(il.eth, headers)
					utils.LogErrorWhileRetrying("failed to subscribe to new blockchain head", retryErr, &retrying, il.logger)
					return retryErr
				},
				utils.ServiceDelayType,
				utils.ServiceRetryAttempts,
				utils.ServiceRetryDelay,
			)

			if resubErr != nil {
				il.logger.Fatal("failed while retrying to subscribe")
			}

		case header := <-headers:
			blockNumber := header.Number
			il.logger.Info("received new block",
				zap.String("hash", header.Hash().String()),
				zap.String("number", blockNumber.String()),
			)

			// Get all events in this block, then process and filter out logs.
			filteredLogs := eth.FilterLogs(il.FetchEventsInBlock(blockNumber))

			// If the ingress layer is syncing, then buffer the logs.
			if il.syncing {
				il.syncLogBuffer = append(il.syncLogBuffer, filteredLogs)
				il.syncLogBufferBlockNumber = append(il.syncLogBufferBlockNumber, blockNumber.Uint64())
				continue
			}
			// If the ingress layer is not syncing, then handle the logs immediately.
			il.handleLogs(filteredLogs)

			// Now that logs have been handled, update the current block number in the database.
			// TODO: consider moving the order of updates when buffering / syncing.
			il.UpdateBlockNumber(il.ChainId(), blockNumber)
		}
	}
}

// Sync performs a sync operation on the ingress layer, processing events in a specified block range.
// If startBlockNumber is not provided, it defaults to the genesis block number.
// If endBlockNumber is not provided, it defaults to the latest block number.
// During the sync, the application is in syncing status and logs are buffered.
// After the sync, the buffered logs are handled, and the syncing status is set to false.
//
// Parameters:
// - startBlockNumber (*big.Int): The starting block number to sync from (optional).
// - endBlockNumber (*big.Int): The ending block number to sync to (optional).
//
// Returns:
// - void.
func (il *Layer) Sync(startBlockNumber *big.Int, endBlockNumber *big.Int) {
	// If the startBlockNumber is not provided, default to the genesis block number.
	if startBlockNumber == nil {
		startBlockNumber = big.NewInt(0)
	}
	// If the endBlockNumber is not provided, default to the latest block number.
	if endBlockNumber == nil {
		endBlockNumber = eth.GetCurrentBlockNumber(il.eth)
	}
	il.logger.Info("syncing from block",
		zap.String("start_block_number", startBlockNumber.String()),
		zap.String("end_block_number", endBlockNumber.String()),
	)

	// Set the syncing status to true.
	il.UpdateSyncStatus(il.ChainId(), true)

	// Get the block number that the state is currently at.
	currentBlockNumber, err := il.rl.GetBlockNumber(il.ChainId())
	if !errors.Is(err, mode.ErrTableDoesNotExist) && err != nil {
		il.logger.Error("failed to get current block number", zap.Error(err))
	}

	// If the current block number is greater than the start block number, then set the start block number to the
	// current block number.
	if currentBlockNumber != nil && currentBlockNumber.Cmp(startBlockNumber) == 1 {
		startBlockNumber = currentBlockNumber
		il.logger.Info("start block number > current block number, set start block number = current block number",
			zap.String("start_block_number", startBlockNumber.String()),
		)
	}

	// For each block from the start block number to the end block number, get the logs and handle them.
	// We use a block batch count to limit the number of blocks that we process at once.
	for i := startBlockNumber.Uint64(); i <= endBlockNumber.Uint64(); i += il.syncConfig.BlockBatchCount {
		// Get the bounds for the start and end blocks.
		blockNumberRangeStart := big.NewInt(int64(i))
		blockNumberRangeEnd := big.NewInt(int64(i + il.syncConfig.BlockBatchCount))
		// Fetch the logs for the block range.
		filteredLogs := eth.FilterLogs(il.FetchEventsInBlockRange(blockNumberRangeStart, blockNumberRangeEnd))
		// Handle the logs.
		il.handleLogs(filteredLogs)
		// Update the block number
		il.UpdateBlockNumber(il.ChainId(), blockNumberRangeEnd)

		il.logger.Info("synced block range",
			zap.String("start", blockNumberRangeStart.String()),
			zap.String("end", blockNumberRangeEnd.String()),
		)
	}

	il.logger.Info("done syncing from block",
		zap.String("start_block_number", startBlockNumber.String()),
		zap.String("end_block_number", endBlockNumber.String()),
	)

	// Now that the sync is done, handle the logs that were buffered during the sync.
	// TODO: use channels.
	for i := 0; i < len(il.syncLogBuffer); i++ {
		il.handleLogs(il.syncLogBuffer[i])
		il.logger.Info("handled buffered block", zap.Uint64("block_number", il.syncLogBufferBlockNumber[i]))
	}

	// Set the syncing status to false.
	il.UpdateSyncStatus(il.ChainId(), false)
	il.logger.Info("finished syncing")
}

// UpdateBlockNumber updates the block number for a given chain using the write layer.
//
// Parameters:
// - chainId (string): The Id of the chain for which to update the block number.
// - blockNumber (*big.Int): The new block number to update.
//
// Returns:
// - void.
func (il *Layer) UpdateBlockNumber(chainId string, blockNumber *big.Int) {
	// Build the row to update or insert (contains the block number).
	row := mode.TableRow{
		"block_number": blockNumber.String(),
		"chain_id":     chainId,
	}
	// Insert the block number into the database.
	table := mode.BlockNumberTable(chainId)
	err := il.wl.UpdateOrInsertRow(table, row, map[string]interface{}{
		"chain_id": chainId,
	})
	if err != nil {
		il.logger.Error("failed to update or insert block number", zap.Error(err))
	}
	il.logger.Info("updated block number",
		zap.String("chain_id", chainId),
		zap.String("block_number", blockNumber.String()),
	)
}

// UpdateSyncStatus updates the syncing status for a given chain using the write layer.
//
// Parameters:
// - chainId (string): The Id of the chain for which to update the syncing status.
// - syncing (bool): The new syncing status to update.
//
// Returns:
// - void.
func (il *Layer) UpdateSyncStatus(chainId string, syncing bool) {
	il.syncing = syncing

	// Build the row to update or insert (contains the syncing status).
	row := mode.TableRow{
		"syncing":  strconv.FormatBool(syncing),
		"chain_id": chainId,
	}
	// Insert the syncing status into the database.
	table := mode.SyncStatusTable(chainId)
	err := il.wl.UpdateOrInsertRow(table, row, map[string]interface{}{
		"chain_id": chainId,
	})
	if err != nil {
		il.logger.Error("failed to update or insert syncing status", zap.Error(err))
	}
	il.logger.Info("updated syncing status", zap.String("chain_id", chainId), zap.Bool("syncing", syncing))
}

// FetchEventsInBlock fetches the events that occurred in a specific block using the Ethereum client.
//
// Parameters:
// - blockNumber (*big.Int): The block number of the block to fetch events from.
//
// Returns:
// - ([]types.Log): A slice of `types.Log` that contains the events that occurred in the block.
func (il *Layer) FetchEventsInBlock(blockNumber *big.Int) []types.Log {
	return il.FetchEventsInBlockRange(blockNumber, blockNumber)
}

// FetchEventsInBlockRange fetches the events that occurred in a specific block range using the Ethereum client.
//
// Parameters:
// - startBlockNumber (*big.Int): The block number of the first block in the range to fetch events from.
// - endBlockNumber (*big.Int): The block number of the last block in the range to fetch events from.
//
// Returns:
// - ([]types.Log): A slice of `types.Log` that contains the events that occurred in the block range.
func (il *Layer) FetchEventsInBlockRange(startBlockNumber *big.Int, endBlockNumber *big.Int) []types.Log {
	query := ethereum.FilterQuery{
		FromBlock: startBlockNumber,
		ToBlock:   endBlockNumber,
		Topics: [][]common.Hash{{
			storecore.ComputeEventId("StoreSetRecord"),
			storecore.ComputeEventId("StoreSetField"),
			storecore.ComputeEventId("StoreDeleteRecord"),
		}},
		Addresses: []common.Address{},
	}
	logs, err := il.eth.FilterLogs(context.Background(), query)
	if err != nil {
		il.logger.Error("failed to get events in block range",
			zap.Uint64("startBlockNumber", startBlockNumber.Uint64()),
			zap.Uint64("endBlockNumber", endBlockNumber.Uint64()),
			zap.Error(err),
		)
	}

	return logs
}

func (il *Layer) ChainId() string {
	return il.chainConfig.Id
}
