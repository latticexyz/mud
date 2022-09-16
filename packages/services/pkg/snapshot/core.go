package snapshot

import (
	"context"
	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/utils"
	"math/big"

	"github.com/avast/retry-go"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

// Start starts the process of processing data from an Ethereum client, reducing the ECS state, and
// taking intermittent snapshots.
func Start(state ChainECSState, client *ethclient.Client, startBlock *big.Int, worldAddresses []common.Address, logger *zap.Logger) {
	// Get an instance of a websocket subscription to the client.
	headers := make(chan *types.Header)
	sub, err := eth.GetEthereumSubscription(client, headers)
	if err != nil {
		logger.Fatal("failed to subscribe to new blockchain head", zap.Error(err))
	}

	for {
		select {
		case err := <-sub.Err():
			logger.Error("failed to receive event from subscription", zap.Error(err))

			var retrying bool = false
			resubErr := retry.Do(
				func() error {
					var err error
					sub, err = eth.GetEthereumSubscription(client, headers)
					utils.LogErrorWhileRetrying("failed to subscribe to new blockchain head", err, &retrying, logger)
					return err
				},
				utils.ServiceDelayType,
				utils.ServiceRetryAttempts,
				utils.ServiceRetryDelay,
			)

			if resubErr != nil {
				logger.Fatal("failed while retrying to subscribe")
			}

		case header := <-headers:
			block, err := client.BlockByHash(context.Background(), header.Hash())
			if err != nil {
				// Skip this header since BlockByHash failed in fetching the block.
				continue
			}

			blockNumber := block.Number()

			// Get all events in this block.
			logs := eth.GetAllEventsInBlock(client, blockNumber, worldAddresses)

			// Process and filter out logs.
			filteredLogs := eth.FilterLogs(logs)

			// Print info about block.
			logger.Info("received block",
				zap.String("category", "Block"),
				zap.Uint64("blockNumber", block.Number().Uint64()),
				zap.String("blockHash", header.Hash().Hex()),
				zap.Int("countLogs", len(logs)),
				zap.Int("countLogsAfterFilter", len(filteredLogs)),
				zap.Int("countTransactions", len(block.Transactions())),
			)

			// Reduce the logs into the state.
			state = reduceLogsIntoState(state, filteredLogs)

			// Take a snapshot every 'n' blocks.
			t := new(big.Int)
			if t.Mod(blockNumber, big.NewInt(SnapshotBlockInterval)).Cmp(big.NewInt(0)) == 0 {
				go takeStateSnapshotChain(state, startBlock.Uint64(), blockNumber.Uint64(), Latest)
			}
		}
	}
}
