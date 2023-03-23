package read

import (
	"latticexyz/mud/packages/services/pkg/mode/db"

	"go.uber.org/zap"
)

// New constructs a new ReadLayer object with the provided database
// layer and logger, and returns a pointer to it.
//
// Parameters:
//   - dl (*db.DatabaseLayer): a pointer to a DatabaseLayer object that
//     provides the database connection to use.
//   - logger (*zap.Logger): a pointer to a zap.Logger object that is used
//     for logging messages.
//
// Returns:
// - (*ReadLayer): a pointer to a new ReadLayer object.
func New(dl *db.DatabaseLayer, logger *zap.Logger) *ReadLayer {
	rl := &ReadLayer{
		dl:     dl,
		logger: logger,
	}

	return rl
}
