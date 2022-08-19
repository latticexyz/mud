package eth

import (
	"context"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/world"
	"math/big"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

func ComputeEventID(eventName string) common.Hash {
	return world.GetWorldABI().Events[eventName].ID
}

func ComputeEventFingerprint(eventName string) string {
	return ComputeEventID(eventName).Hex()
}

func GetAllEventsInBlock(client *ethclient.Client, blockNumber *big.Int, worldAddresses []common.Address) (logs []types.Log) {
	logs, err := GetAllEventsInRange(client, blockNumber, blockNumber, worldAddresses)
	if err != nil {
		logger.GetLogger().Fatal("failed to get events in block", zap.Uint64("blockNumber", blockNumber.Uint64()), zap.Error(err))
	}
	return
}

func GetAllEventsInRange(client *ethclient.Client, start *big.Int, end *big.Int, worldAddresses []common.Address) ([]types.Log, error) {
	query := ethereum.FilterQuery{
		FromBlock: start,
		ToBlock:   end,
		Topics: [][]common.Hash{{
			ComputeEventID("ComponentRegistered"),
			ComputeEventID("ComponentValueSet"),
			ComputeEventID("ComponentValueRemoved"),
		}},
		Addresses: worldAddresses,
	}
	logs, err := client.FilterLogs(context.Background(), query)

	return logs, err
}

func ParseEventComponentRegistered(log types.Log) (*world.WorldComponentRegistered, error) {
	event := new(world.WorldComponentRegistered)
	if err := UnpackLog(event, "ComponentRegistered", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

func ParseEventComponentValueSet(log types.Log) (*world.WorldComponentValueSet, error) {
	event := new(world.WorldComponentValueSet)
	if err := UnpackLog(event, "ComponentValueSet", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

func ParseEventComponentValueRemoved(log types.Log) (*world.WorldComponentValueRemoved, error) {
	event := new(world.WorldComponentValueRemoved)
	if err := UnpackLog(event, "ComponentValueRemoved", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
