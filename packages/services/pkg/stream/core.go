package stream

import (
	"context"
	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/multiplexer"
	"latticexyz/mud/packages/services/pkg/utils"

	"github.com/avast/retry-go"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

func Start(client *ethclient.Client, multiplexer *multiplexer.Multiplexer, logger *zap.Logger) {
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
			logger.Info(`received block, piping into multiplexer publish channel`,
				zap.String("header", header.Hash().Hex()),
			)

			// Publish block to the multiplexer to be piped through the channel to subscribers.
			multiplexer.Publish(block)
		}
	}
}
