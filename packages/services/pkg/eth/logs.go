package eth

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/world"
	"sort"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/core/types"
)

func FilterLogs(logs []types.Log) []types.Log {
	// Filter removed logs due to chain reorgs.
	filteredLogs := []types.Log{}
	for _, log := range logs {
		if !log.Removed {
			filteredLogs = append(filteredLogs, log)
		}
	}

	// Order logs.
	sort.SliceStable(filteredLogs, func(i, j int) bool {
		first := filteredLogs[i]
		second := filteredLogs[j]
		if first.BlockNumber < second.BlockNumber {
			return true
		} else if second.BlockNumber < first.BlockNumber {
			return false
		} else {
			if first.TxIndex < second.TxIndex {
				return true
			} else if second.TxIndex < first.TxIndex {
				return false
			} else {
				return first.Index < second.Index
			}
		}
	})

	return filteredLogs
}

func UnpackLog(out interface{}, eventName string, log types.Log) error {
	worldAbi := world.GetWorldABI()
	if log.Topics[0] != worldAbi.Events[eventName].ID {
		return fmt.Errorf("event signature mismatch")
	}
	if len(log.Data) > 0 {
		if err := worldAbi.UnpackIntoInterface(out, eventName, log.Data); err != nil {
			return err
		}
	}
	var indexed abi.Arguments
	for _, arg := range worldAbi.Events[eventName].Inputs {
		if arg.Indexed {
			indexed = append(indexed, arg)
		}
	}
	return abi.ParseTopics(out, indexed, log.Topics[1:])
}
