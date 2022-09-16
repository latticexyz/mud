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

// ComputeEventID returns a hash of a given event using the World ECS ABI.
func ComputeEventID(eventName string) common.Hash {
	return world.GetWorldABI().Events[eventName].ID
}

// ComputeEventFingerprint returns the EventID as computed by ComputeEventID but as a hex string.
func ComputeEventFingerprint(eventName string) string {
	return ComputeEventID(eventName).Hex()
}

// GetAllEventsInBlock uses GetAllEventsInRange to return all ECS events in a given blockNumber.
func GetAllEventsInBlock(client *ethclient.Client, blockNumber *big.Int, worldAddresses []common.Address) (logs []types.Log) {
	logs, err := GetAllEventsInRange(client, blockNumber, blockNumber, worldAddresses)
	if err != nil {
		logger.GetLogger().Fatal("failed to get events in block", zap.Uint64("blockNumber", blockNumber.Uint64()), zap.Error(err))
	}
	return
}

// GetAllEventsInRange returns a list of ECS event logs given a start block and an end block (both
// big integers) and a worldAddresses filter. The worldAddresses may be an empty array in which
// case no filtering based on the contract address is applied to the logs.
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

// ParseEventComponentRegistered extracts a structured ComponentRegistered event from a log.
func ParseEventComponentRegistered(log types.Log) (*world.WorldComponentRegistered, error) {
	event := new(world.WorldComponentRegistered)
	if err := UnpackLog(event, "ComponentRegistered", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ParseEventComponentValueSet extracts a structured ComponentValueSet event from a log.
func ParseEventComponentValueSet(log types.Log) (*world.WorldComponentValueSet, error) {
	event := new(world.WorldComponentValueSet)
	if err := UnpackLog(event, "ComponentValueSet", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ParseEventComponentValueRemoved extracts a structured ComponentValueRemoved event from a log.
func ParseEventComponentValueRemoved(log types.Log) (*world.WorldComponentValueRemoved, error) {
	event := new(world.WorldComponentValueRemoved)
	if err := UnpackLog(event, "ComponentValueRemoved", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
