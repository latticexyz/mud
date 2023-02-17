package query

import (
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type QueryLayer struct {
	pb_mode.UnimplementedQueryLayerServer

	eth *ethclient.Client
	db  *sqlx.DB

	tableSchemas map[string]*mode.TableSchema

	logger *zap.Logger
}
