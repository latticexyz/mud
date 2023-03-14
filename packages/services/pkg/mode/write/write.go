package write

import (
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/schema"

	"go.uber.org/zap"
)

func New(dl *db.DatabaseLayer, logger *zap.Logger) *WriteLayer {
	wl := &WriteLayer{
		dl:     dl,
		logger: logger,
	}

	// Perform MODE-specific actions on the write layer.
	err := wl.CreateTable(schema.NamespacesTableSchema())
	if err != nil {
		wl.logger.Fatal("failed to create table", zap.Error(err))
	}
	err = wl.CreateTable(schema.BlockNumberTableSchema())
	if err != nil {
		wl.logger.Fatal("failed to create table", zap.Error(err))
	}

	return wl
}
