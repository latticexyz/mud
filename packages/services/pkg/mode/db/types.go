package db

import (
	"latticexyz/mud/packages/services/pkg/multiplexer"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type WALConfig struct {
	OutputPlugin     string
	OutputPluginArgs []string
	SlotName         string
	PublicationName  string
	// Send a standby status update every N seconds.
	StandbyTimeout time.Duration
}

type DatabaseLayer struct {
	db        *sqlx.DB
	conn      *pgconn.PgConn
	walConfig *WALConfig

	multiplexer *multiplexer.Multiplexer

	logger *zap.Logger
}

type StreamEventType string

const (
	StreamEventTypeInsert StreamEventType = "insert"
	StreamEventTypeUpdate StreamEventType = "update"
	StreamEventTypeDelete StreamEventType = "delete"
)

type StreamEvent struct {
	// The type of event.
	Type StreamEventType
	// The name of the table.
	TableName string
	// Values.
	Values map[string]interface{}
}
