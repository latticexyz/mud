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
	// TODO: this is not really used right now, consider removing or refactoring logic.
	err := wl.CreateTable(schema.Internal__NamespacesTableSchema())
	if err != nil {
		wl.logger.Fatal("failed to create table", zap.Error(err))
	}
	return wl
}
