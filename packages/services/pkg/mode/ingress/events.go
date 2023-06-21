package ingress

import (
	"latticexyz/mud/packages/services/pkg/mode/storecore"

	"github.com/ethereum/go-ethereum/common"
)

// StoreSetRecordEvent returns the event Id for the "StoreSetRecord" event.
//
// Parameters: None.
//
// Returns:
// - common.Hash: The event Id for the "StoreSetRecord" event.
func StoreSetRecordEvent() common.Hash {
	return storecore.ComputeEventId("StoreSetRecord")
}

// StoreSetFieldEvent returns the event Id for the "StoreSetField" event.
//
// Parameters: None.
//
// Returns:
// - common.Hash: The event Id for the "StoreSetField" event.
func StoreSetFieldEvent() common.Hash {
	return storecore.ComputeEventId("StoreSetField")
}

// StoreDeleteRecordEvent returns the event Id for the "StoreDeleteRecord" event.
//
// Parameters: None.
//
// Returns:
// - common.Hash: The event Id for the "StoreDeleteRecord" event.
func StoreDeleteRecordEvent() common.Hash {
	return storecore.ComputeEventId("StoreDeleteRecord")
}
