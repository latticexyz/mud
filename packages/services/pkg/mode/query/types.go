package query

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"github.com/ethereum/go-ethereum/ethclient"
	"go.uber.org/zap"
)

type QueryLayer struct {
	pb_mode.UnimplementedQueryLayerServer

	eth *ethclient.Client
	dl  *db.DatabaseLayer

	tableSchemas map[string]*mode.TableSchema

	logger *zap.Logger
}
