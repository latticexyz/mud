package world

import (
	"latticexyz/chain-sidecar/pkg/logger"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"go.uber.org/zap"
)

func GetWorldABI() (contractAbi abi.ABI) {
	contractAbi, err := abi.JSON(strings.NewReader(string(WorldABI)))
	if err != nil {
		logger.GetLogger().Fatal("failed to parse the world ABI",
			zap.Error(err),
		)
	}
	return
}
