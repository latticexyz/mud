package ingress

import (
	"context"
	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/mode/config"
	"latticexyz/mud/packages/services/pkg/mode/read"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	"latticexyz/mud/packages/services/pkg/mode/write"
	"latticexyz/mud/packages/services/pkg/utils"
	"math/big"

	"github.com/avast/retry-go"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

type IngressLayer struct {
	eth *ethclient.Client
	wl  *write.WriteLayer
	rl  *read.ReadLayer

	schemaCache *schema.SchemaCache
	chainConfig *config.ChainConfig

	logger *zap.Logger
}

func New(config *config.ChainConfig, wl *write.WriteLayer, rl *read.ReadLayer, schemaCache *schema.SchemaCache, logger *zap.Logger) *IngressLayer {
	logger.Info("creating ingress layer connected to websocket", zap.String("ws", config.Rpc.Ws))

	// Create a connection to an Ethereum execution client.
	eth := eth.GetEthereumClient(config.Rpc.Ws, logger)

	// Perform chain-specific actions on the write layer.
	// Create a table that stores the schemas for every table on the chain that this ingress layer is indexing.
	wl.CreateTable(schema.Internal__SchemaTableSchema(config.Id))

	return &IngressLayer{
		eth:         eth,
		wl:          wl,
		rl:          rl,
		schemaCache: schemaCache,
		chainConfig: config,
		logger:      logger,
	}
}

func (il *IngressLayer) Run() {
	// Get an instance of a websocket subscription to the client.
	headers := make(chan *types.Header)
	sub, err := eth.GetEthereumSubscription(il.eth, headers)
	if err != nil {
		il.logger.Fatal("failed to subscribe to block headers", zap.Error(err))
	}

	// The loop is: react to block headers (new blocks) and parse each block.
	for {
		select {
		case err := <-sub.Err():
			il.logger.Error("failed to receive event from subscription", zap.Error(err))

			var retrying bool = false
			resubErr := retry.Do(
				func() error {
					var err error
					sub, err = eth.GetEthereumSubscription(il.eth, headers)
					utils.LogErrorWhileRetrying("failed to subscribe to new blockchain head", err, &retrying, il.logger)
					return err
				},
				utils.ServiceDelayType,
				utils.ServiceRetryAttempts,
				utils.ServiceRetryDelay,
			)

			if resubErr != nil {
				il.logger.Fatal("failed while retrying to subscribe")
			}

		case header := <-headers:
			block, err := il.eth.BlockByHash(context.Background(), header.Hash())
			if err != nil {
				// Skip this header since BlockByHash failed in fetching the block.
				continue
			}

			blockNumber := block.Number()
			il.logger.Info("received new block", zap.String("hash", header.Hash().String()), zap.String("number", blockNumber.String()))

			// Update the current block number in the database.
			il.UpdateBlockNumber(il.chainConfig.Id, blockNumber)

			// Get all events in this block, then process and filter out logs.
			filteredLogs := eth.FilterLogs(il.FetchEventsInBlock(blockNumber))

			// Process each log and handle any MUD events.
			for _, vLog := range filteredLogs {
				switch vLog.Topics[0].Hex() {
				case StoreSetRecordEvent().Hex():
					event, err := ParseStoreSetRecord(vLog)
					if err != nil {
						il.logger.Error("failed to parse StoreSetRecord event", zap.Error(err))
						continue
					}
					il.handleSetRecordEvent(event)
				case StoreSetFieldEvent().Hex():
					event, err := ParseStoreSetField(vLog)
					if err != nil {
						il.logger.Error("failed to parse StoreSetField event", zap.Error(err))
						continue
					}
					il.handleSetFieldEvent(event)
				case StoreDeleteRecordEvent().Hex():
					event, err := ParseStoreDeleteRecord(vLog)
					if err != nil {
						il.logger.Error("failed to parse StoreDeleteRecord event", zap.Error(err))
						continue
					}
					il.handleDeleteRecordEvent(event)
				}
			}
		}
	}
}

func (il *IngressLayer) UpdateBlockNumber(chainId string, blockNumber *big.Int) {
	// Build the row to update or insert (contains the block number).
	row := write.RowKV{
		"chain_id":     chainId,
		"block_number": blockNumber.String(),
	}
	// Insert the block number into the database.
	tableSchema := schema.Internal__BlockNumberTableSchema()
	filter := tableSchema.FilterFromMap(map[string]string{"chain_id": chainId})
	err := il.wl.UpdateOrInsertRow(tableSchema, row, filter)
	if err != nil {
		il.logger.Error("failed to update or insert block number", zap.Error(err))
	}
	il.logger.Info("updated block number", zap.String("chain_id", chainId), zap.String("block_number", blockNumber.String()))
}

func (il *IngressLayer) FetchEventsInBlock(blockNumber *big.Int) (logs []types.Log) {
	logs, err := il.FetchEventsInRange(blockNumber, blockNumber)
	if err != nil {
		il.logger.Fatal("failed to get events in block", zap.Uint64("blockNumber", blockNumber.Uint64()), zap.Error(err))
	}
	return
}

func (il *IngressLayer) FetchEventsInRange(start *big.Int, end *big.Int) ([]types.Log, error) {
	query := ethereum.FilterQuery{
		FromBlock: start,
		ToBlock:   end,
		Topics: [][]common.Hash{{
			storecore.ComputeEventID("StoreSetRecord"),
			storecore.ComputeEventID("StoreSetField"),
			storecore.ComputeEventID("StoreDeleteRecord"),
		}},
		Addresses: []common.Address{},
	}
	logs, err := il.eth.FilterLogs(context.Background(), query)

	return logs, err
}
