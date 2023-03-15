package ingress

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/core/types"
)

// ParseStoreSetRecord extracts a structured StoreSetRecord event from a log.
func ParseStoreSetRecord(log types.Log) (*storecore.StorecoreStoreSetRecord, error) {
	event := new(storecore.StorecoreStoreSetRecord)
	if err := UnpackLog(event, "StoreSetRecord", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ParseStoreSetField extracts a structured StoreSetField event from a log.
func ParseStoreSetField(log types.Log) (*storecore.StorecoreStoreSetField, error) {
	event := new(storecore.StorecoreStoreSetField)
	if err := UnpackLog(event, "StoreSetField", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ParseStoreDeleteRecord extracts a structured StoreDeleteRecord event from a log.
func ParseStoreDeleteRecord(log types.Log) (*storecore.StorecoreStoreDeleteRecord, error) {
	event := new(storecore.StorecoreStoreDeleteRecord)
	if err := UnpackLog(event, "StoreDeleteRecord", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// UnpackLog extracts an event from a log given an eventName and places it into out.
func UnpackLog(out interface{}, eventName string, log types.Log) error {
	storecoreAbi := storecore.GetABI()
	if log.Topics[0] != storecoreAbi.Events[eventName].ID {
		return fmt.Errorf("event signature mismatch")
	}
	if len(log.Data) > 0 {
		if err := storecoreAbi.UnpackIntoInterface(out, eventName, log.Data); err != nil {
			return err
		}
	}
	var indexed abi.Arguments
	for _, arg := range storecoreAbi.Events[eventName].Inputs {
		if arg.Indexed {
			indexed = append(indexed, arg)
		}
	}
	return abi.ParseTopics(out, indexed, log.Topics[1:])
}

// TODO: proper parsing + implementation
func KeyToFilter(tableSchema *mode.TableSchema, key [][32]byte) []*pb_mode.Filter {
	filters := []*pb_mode.Filter{}
	println("HAVE KEYS: " + fmt.Sprint(len(key)))
	println(key)
	for i := 0; i < len(key); i++ {
		tmp := make([]byte, 32)
		copy(tmp, key[i][:])
		println("KEY: " + fmt.Sprint(tmp))
		println(tmp)

		filters = append(filters, &pb_mode.Filter{
			Field: &pb_mode.Field{
				TableName:  tableSchema.TableName,
				TableField: tableSchema.KeyNames[i],
			},
			Operator: "=",
			Value:    fmt.Sprint(tmp),
		})
	}
	return filters
}
