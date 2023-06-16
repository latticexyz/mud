package write

import (
	"latticexyz/mud/packages/services/pkg/mode/db"

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
func New(dl *db.DatabaseLayer, logger *zap.Logger) *Layer {
	wl := &Layer{
		dl:     dl,
		logger: logger,
	}
	return wl
}
