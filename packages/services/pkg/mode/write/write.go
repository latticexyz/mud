package write

import (
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/schema"

	"go.uber.org/zap"
)

// New creates a new WriteLayer instance with the specified DatabaseLayer and Logger instances.
// The function returns a pointer to a WriteLayer instance.
//
// Parameters:
// - dl (*db.DatabaseLayer): A pointer to the DatabaseLayer instance for the WriteLayer.
// - logger (*zap.Logger): A pointer to the Logger instance for the WriteLayer.
//
// Returns:
// (*WriteLayer) - A pointer to a WriteLayer instance.
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
