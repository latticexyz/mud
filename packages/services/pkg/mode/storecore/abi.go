package storecore

import (
	"latticexyz/mud/packages/services/pkg/logger"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"go.uber.org/zap"
)

func GetABI() (storecoreAbi abi.ABI) {
	storecoreAbi, err := abi.JSON(strings.NewReader(string(StorecoreABI)))
	if err != nil {
		logger.GetLogger().Fatal("failed to parse the world ABI", zap.Error(err))
	}
	return
}

// ComputeEventID returns a hash of a given event using the StoreCore ABI.
func ComputeEventID(eventName string) common.Hash {
	return GetABI().Events[eventName].ID
}

// ComputeEventFingerprint returns the EventID as computed by ComputeEventID but as a hex string.
func ComputeEventFingerprint(eventName string) string {
	return ComputeEventID(eventName).Hex()
}

func (event *StorecoreStoreSetRecord) WorldAddress() string {
	return event.Raw.Address.Hex()
}

func (event *StorecoreStoreSetField) WorldAddress() string {
	return event.Raw.Address.Hex()
}

func (event *StorecoreStoreDeleteRecord) WorldAddress() string {
	return event.Raw.Address.Hex()
}
