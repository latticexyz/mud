package ingress

import (
	"latticexyz/mud/packages/services/pkg/mode/config"
	"latticexyz/mud/packages/services/pkg/mode/read"
	"latticexyz/mud/packages/services/pkg/mode/tablestore"
	"latticexyz/mud/packages/services/pkg/mode/write"

	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

type Layer struct {
	eth *ethclient.Client
	wl  *write.Layer
	rl  *read.Layer

	tableStore *tablestore.Store

	chainConfig config.ChainConfig
	syncConfig  config.SyncConfig

	syncing                  bool
	syncLogBuffer            [][]types.Log
	syncLogBufferBlockNumber []uint64

	logger *zap.Logger
}
