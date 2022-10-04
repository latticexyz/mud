package eth

import (
	"context"
	"latticexyz/mud/packages/services/pkg/logger"
	utils "latticexyz/mud/packages/services/pkg/utils"
	"math/big"

	"github.com/avast/retry-go"
	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

// GetEthereumClient returns a connection to an Ethereum client via a websocket URL specified by
// wsUrl. In the case that a connection cannot be established, will retry for a fixed duration.
func GetEthereumClient(wsUrl string, logger *zap.Logger) *ethclient.Client {
	var client *ethclient.Client
	var retrying bool = false

	err := retry.Do(
		func() error {
			var err error
			client, err = ethclient.Dial(wsUrl)
			utils.LogErrorWhileRetrying("failed to get an Ethereum Client", err, &retrying, logger)
			return err
		},
		utils.ServiceDelayType,
		utils.ServiceRetryAttempts,
		utils.ServiceRetryDelay,
	)

	if err != nil {
		logger.Fatal("failed while retrying to get an Ethereum Client", zap.Error(err))
	}
	return client
}

// GetEthereumSubscription returns a subscription to new blocks.
func GetEthereumSubscription(client *ethclient.Client, headers chan *types.Header) (ethereum.Subscription, error) {
	return client.SubscribeNewHead(context.Background(), headers)
}

// GetCurrentBlockHead returns the block number of the block at the tip of the chain.
func GetCurrentBlockHead(client *ethclient.Client) *big.Int {
	currentHead, err := client.HeaderByNumber(context.Background(), nil)
	if err != nil {
		logger.GetLogger().Fatal("failed to get the current block head",
			zap.Error(err),
		)
	}
	return currentHead.Number
}

// GetCurrentBalance returns the current balance of account with given address.
func GetCurrentBalance(client *ethclient.Client, address string) (uint64, error) {
	balance, err := client.BalanceAt(context.Background(), common.HexToAddress(address), nil)
	if err != nil {
		logger.GetLogger().Error("couldn't get current balance for account", zap.String("address", address), zap.Error(err))
		return 0, err
	}
	return balance.Uint64(), nil
}
