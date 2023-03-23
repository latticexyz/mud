package ingress

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/mode/storecore"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/core/types"
)

// ParseStoreSetRecord extracts a structured StoreSetRecord event from a log.
//
// Parameters:
// - log: The log to parse.
//
// Returns:
// - *storecore.StorecoreStoreSetRecord: The parsed StorecoreStoreSetRecord event.
// - error: An error, if one occurred during parsing.
func ParseStoreSetRecord(log types.Log) (*storecore.StorecoreStoreSetRecord, error) {
	event := new(storecore.StorecoreStoreSetRecord)
	if err := UnpackLog(event, "StoreSetRecord", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ParseStoreSetField extracts a structured StoreSetField event from a log.
//
// Parameters:
// - log: The log to parse.
//
// Returns:
// - *storecore.StorecoreStoreSetField: The parsed StorecoreStoreSetField event.
// - error: An error, if one occurred during parsing.
func ParseStoreSetField(log types.Log) (*storecore.StorecoreStoreSetField, error) {
	event := new(storecore.StorecoreStoreSetField)
	if err := UnpackLog(event, "StoreSetField", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// ParseStoreDeleteRecord extracts a structured StoreDeleteRecord event from a log.
//
// Parameters:
// - log: The log to parse.
//
// Returns:
// - *storecore.StorecoreStoreDeleteRecord: The parsed StorecoreStoreDeleteRecord event.
// - error: An error, if one occurred during parsing.
func ParseStoreDeleteRecord(log types.Log) (*storecore.StorecoreStoreDeleteRecord, error) {
	event := new(storecore.StorecoreStoreDeleteRecord)
	if err := UnpackLog(event, "StoreDeleteRecord", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// UnpackLog extracts an event from a log given an eventName and places it into out.
//
// Parameters:
// - out: The output interface into which to unpack the log.
// - eventName: The name of the event corresponding to the log.
// - log: The log to unpack.
//
// Returns:
// - error: An error, if one occurred during unpacking.
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
