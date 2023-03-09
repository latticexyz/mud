package ingress

import (
	"latticexyz/mud/packages/services/pkg/mode/storecore"

	"github.com/ethereum/go-ethereum/common"
)

func StoreSetRecordEvent() common.Hash {
	return storecore.ComputeEventID("StoreSetRecord")
}

func StoreSetFieldEvent() common.Hash {
	return storecore.ComputeEventID("StoreSetField")
}

func StoreDeleteRecordEvent() common.Hash {
	return storecore.ComputeEventID("StoreDeleteRecord")
}
