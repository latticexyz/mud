package db

import (
	"latticexyz/mud/packages/services/pkg/multiplexer"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// WALConfig represents the configuration for the Write-Ahead Log (WAL) for PostgreSQL.
type WALConfig struct {
	// OutputPlugin is the name of the output plugin to use for the WAL.
	OutputPlugin string
	// OutputPluginArgs are any arguments to pass to the output plugin.
	OutputPluginArgs []string
	// SlotName is the name of the logical replication slot to use.
	SlotName string
	// PublicationName is the name of the publication to use for the WAL.
	PublicationName string
	// StandbyTimeout is the duration between standby status updates.
	StandbyTimeout time.Duration
}

// DatabaseLayer is the layer responsible for handling all low-level interactions with the PostgreSQL database.
type DatabaseLayer struct {
	// db is the connection to the database.
	db *sqlx.DB
	// gorm__db is the connection to the database.
	gorm__db *gorm.DB

	// conn is the low-level connection to the database.
	conn *pgconn.PgConn
	// walConfig is the configuration for the Write-Ahead Log (WAL).
	walConfig *WALConfig
	// multiplexer is the multiplexer used to stream changes from the database.
	multiplexer *multiplexer.Multiplexer
	// logger is the logger used for logging events in the database layer.
	logger *zap.Logger
}

// StreamEventType represents the type of event that occurred during a stream event.
type StreamEventType string

const (
	// StreamEventTypeInsert represents an insert event.
	StreamEventTypeInsert StreamEventType = "insert"
	// StreamEventTypeUpdate represents an update event.
	StreamEventTypeUpdate StreamEventType = "update"
	// StreamEventTypeDelete represents a delete event.
	StreamEventTypeDelete StreamEventType = "delete"
)

// StreamEvent represents an event that occurred during a database stream.
type StreamEvent struct {
	// Type is the type of event.
	Type StreamEventType
	// TableName is the name of the table where the event occurred.
	TableName string
	// Values are the values associated with the event.
	Values map[string]interface{}
}
