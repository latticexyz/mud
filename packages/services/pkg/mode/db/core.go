package db

import (
	"context"
	"database/sql"
	"fmt"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/multiplexer"
	"time"

	"github.com/jackc/pglogrepl"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgproto3"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// connectToDatabase creates a connection to a PostgreSQL database using the specified DSN.
//
// Parameters:
//   - dsn (string): The Data Source Name to connect to the database.
//
// Returns:
//   - (*sqlx.DB): A pointer to the connected database instance.
//   - (error): An error if any occurred during the connection process.
func connectToDatabase(dsn string) (*sqlx.DB, error) {
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		return nil, err
	}

	var dbName string
	err = db.Get(&dbName, "SELECT current_database()")
	if err != nil {
		return nil, err
	}
	logger.GetLogger().Info("connected to db", zap.String("name", dbName))

	return db, nil
}

// gorm__connectToDatabase creates a connection to a PostgreSQL database using the specified DSN
// via GORM.
//
// Parameters:
//   - dsn (string): The Data Source Name to connect to the database.
//
// Returns:
//   - (*gorm.DB): A pointer to the connected database instance via GORM.
//   - (error): An error if any occurred during the connection process.
func gorm__connectToDatabase(dsn string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	var dbName string
	db.Raw("SELECT current_database()").Scan(&dbName)
	logger.GetLogger().Info("connected to db", zap.String("name", dbName))

	return db, nil
}

// wipeSchemas drops all the schemas from the specified database except for internal schemas.
//
// Parameters:
//   - db (*sql.DB): The database connection instance to use.
//   - logger (*zap.Logger): The logger to use for logging messages.
//
// Returns:
//   - (error): An error if any occurred during the schema wiping process.
func wipeSchemas(db *sql.DB, logger *zap.Logger) error {
	rows, err := db.Query(`
		SELECT n.nspname
		FROM pg_catalog.pg_namespace n
		WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
	`)
	if err != nil {
		return err
	}

	var schemas []string
	for rows.Next() {
		var schemaName string
		if err = rows.Scan(&schemaName); err != nil {
			return err
		}
		schemas = append(schemas, schemaName)
	}

	for _, schema := range schemas {
		_, err = db.Exec("DROP SCHEMA IF EXISTS " + schema + " CASCADE")
		if err != nil {
			return err
		}
		logger.Info("dropped schema", zap.String("schema", schema))
	}

	return nil
}

// NewDatabaseLayer creates a new instance of the DatabaseLayer struct with the given configuration.
//
// Parameters:
// - ctx (context.Context): The context of the request.
// - dsn (string): The DSN of the database to connect to.
// - wipe (bool): Whether or not to wipe the database.
// - logger (*zap.Logger): The logger to use for logging messages.
//
// Returns:
// - (*DatabaseLayer): The new instance of the DatabaseLayer struct.
func NewDatabaseLayer(
	ctx context.Context,
	dsn string,
	gorm__dsn string,
	wipe bool,
	logger *zap.Logger,
) *DatabaseLayer {

	// Connect to the database using sqlx so we can use the sqlx package.
	db, err := connectToDatabase(dsn)
	if err != nil {
		logger.Fatal("failed to connect to database", zap.Error(err))
	}

	gorm__db, err := gorm__connectToDatabase(gorm__dsn)
	if err != nil {
		logger.Fatal("failed to connect to database", zap.Error(err))
	}

	// Connect to the database using pgconn so we can use the pglogrepl package.
	conn, err := pgconn.Connect(ctx, dsn)
	if err != nil {
		logger.Fatal("failed to connect to database", zap.Error(err))
	}

	// If running with wipe ON, wipe the database.
	if wipe {
		logger.Info("wiping the database")
		err = wipeSchemas(db.DB, logger)
		if err != nil {
			logger.Error("failed to wipe the database", zap.Error(err))
		}
	}

	// Create a WAL configuration object.
	walConfig := &WALConfig{
		OutputPlugin:     "pgoutput",
		OutputPluginArgs: []string{"proto_version '1'", "publication_names 'pglogrepl_mode'"},
		SlotName:         "pglogrepl_mode",
		PublicationName:  "pglogrepl_mode",
		StandbyTimeout:   time.Second * 10,
	}

	// Create a multiplexer to multiplex the replication stream.
	multiplexer := multiplexer.NewMultiplexer()

	return &DatabaseLayer{
		db:          db,
		gorm__db:    gorm__db,
		conn:        conn,
		walConfig:   walConfig,
		multiplexer: multiplexer,
		logger:      logger,
	}
}

// RunDatabaseLayer runs the database layer.
// It starts the multiplexer, prepares the database for replication, creates a replication slot,
// starts replication, and consumes WAL data, forwarding relevant events to the multiplexer.
//
// Parameters:
// - ctx: A context object for the function call.
//
// Returns:
// - void
func (dl *DatabaseLayer) RunDatabaseLayer(ctx context.Context) {
	defer dl.conn.Close(context.Background())

	// Start the multiplexer.
	go dl.multiplexer.Start()

	// Prepare the database for replication.
	result := dl.conn.Exec(context.Background(), "DROP PUBLICATION IF EXISTS "+dl.walConfig.PublicationName+";")
	_, err := result.ReadAll()
	if err != nil {
		dl.logger.Fatal("failed to drop publication", zap.Error(err))
	}

	result = dl.conn.Exec(context.Background(), "CREATE PUBLICATION "+dl.walConfig.PublicationName+" FOR ALL TABLES;")
	_, err = result.ReadAll()
	if err != nil {
		dl.logger.Fatal("failed to create publication", zap.Error(err))
	}
	dl.logger.Info("publication created")

	sysident, err := pglogrepl.IdentifySystem(context.Background(), dl.conn)
	if err != nil {
		dl.logger.Fatal("failed to identify system", zap.Error(err))
	}
	dl.logger.Info("system identified", zap.String("system_id", sysident.SystemID), zap.Int32("timeline", sysident.Timeline), zap.String("xlogpos", sysident.XLogPos.String()), zap.String("dbname", sysident.DBName))

	_, err = pglogrepl.CreateReplicationSlot(context.Background(), dl.conn, dl.walConfig.SlotName, dl.walConfig.OutputPlugin, pglogrepl.CreateReplicationSlotOptions{Temporary: true})
	if err != nil {
		dl.logger.Fatal("failed to create replication slot", zap.Error(err))
	}
	dl.logger.Info("replication slot created", zap.String("name", dl.walConfig.SlotName))

	// Start replication.
	err = pglogrepl.StartReplication(context.Background(), dl.conn, dl.walConfig.SlotName, sysident.XLogPos, pglogrepl.StartReplicationOptions{PluginArgs: dl.walConfig.OutputPluginArgs})
	if err != nil {
		dl.logger.Fatal("failed to start replication", zap.Error(err))
	}
	dl.logger.Info("replication started on slot", zap.String("name", dl.walConfig.SlotName))

	clientXLogPos := sysident.XLogPos
	nextStandbyMessageDeadline := time.Now().Add(dl.walConfig.StandbyTimeout)

	// Relations is a map of relation OIDs to relation metadata.
	relations := map[uint32]*pglogrepl.RelationMessage{}
	typeMap := pgtype.NewMap()

	for {
		if time.Now().After(nextStandbyMessageDeadline) {
			err = pglogrepl.SendStandbyStatusUpdate(context.Background(), dl.conn, pglogrepl.StandbyStatusUpdate{WALWritePosition: clientXLogPos})
			if err != nil {
				dl.logger.Fatal("failed to send standby status update", zap.Error(err))
			}
			dl.logger.Info("sent standby status message", zap.String("xlogpos", clientXLogPos.String()))

			nextStandbyMessageDeadline = time.Now().Add(dl.walConfig.StandbyTimeout)
		}

		ctx, cancel := context.WithDeadline(context.Background(), nextStandbyMessageDeadline)
		rawMsg, err := dl.conn.ReceiveMessage(ctx)
		cancel()
		if err != nil {
			if pgconn.Timeout(err) {
				continue
			}
			dl.logger.Fatal("failed to receive message", zap.Error(err))
		}

		// Check if the message is an error message from the server.
		if errMsg, ok := rawMsg.(*pgproto3.ErrorResponse); ok {
			dl.logger.Fatal("received Postgres WAL error", zap.String("error", errMsg.Message))
		}

		// We only care about CopyData messages.
		msg, ok := rawMsg.(*pgproto3.CopyData)
		if !ok {
			dl.logger.Info("received unexpected message", zap.String("message", fmt.Sprintf("%T", rawMsg)))
			continue
		}

		// Parse the message.
		switch msg.Data[0] {
		// The server is sending us a keepalive message.
		case pglogrepl.PrimaryKeepaliveMessageByteID:
			pkm, err := pglogrepl.ParsePrimaryKeepaliveMessage(msg.Data[1:])
			if err != nil {
				dl.logger.Fatal("failed to parse primary keepalive message", zap.Error(err))
			}
			dl.logger.Info("received keepalive message", zap.String("xlogpos", pkm.ServerWALEnd.String()), zap.Time("server_time", pkm.ServerTime), zap.Bool("reply_requested", pkm.ReplyRequested))

			if pkm.ReplyRequested {
				nextStandbyMessageDeadline = time.Time{}
			}
		// The server is sending us WAL data.
		case pglogrepl.XLogDataByteID:
			xld, err := pglogrepl.ParseXLogData(msg.Data[1:])
			if err != nil {
				dl.logger.Fatal("failed to parse xlog data", zap.Error(err))
			}
			// dl.logger.Info("received WAL data", zap.String("wal_start", xld.WALStart.String()), zap.String("wal_end", xld.ServerWALEnd.String()), zap.Time("server_time", xld.ServerTime), zap.String("wal_data", hex.Dump(xld.WALData)))

			logicalMsg, err := pglogrepl.Parse(xld.WALData)
			if err != nil {
				dl.logger.Fatal("failed to parse logical replication message", zap.Error(err))
			}
			// dl.logger.Info("received logical replication message", zap.String("message", logicalMsg.Type().String()))

			switch logicalMsg := logicalMsg.(type) {
			// Record the data for the relation.
			case *pglogrepl.RelationMessage:
				relations[logicalMsg.RelationID] = logicalMsg
			// For now we only care about INSERT, UPDATE and DELETE messages.
			case *pglogrepl.InsertMessage:
				dl.multiplexer.Publish(dl.createInsertEvent(logicalMsg, relations, typeMap))
			case *pglogrepl.UpdateMessage:
				dl.multiplexer.Publish(dl.createUpdateEvent(logicalMsg, relations, typeMap))
			case *pglogrepl.DeleteMessage:
				dl.multiplexer.Publish(dl.createDeleteEvent(logicalMsg, relations, typeMap))
			case *pglogrepl.BeginMessage:
				// Beginning of a group of changes in a transaction.
			case *pglogrepl.CommitMessage:
				// Commit of a group of changes in a transaction.
			case *pglogrepl.TruncateMessage:
			case *pglogrepl.TypeMessage:
			case *pglogrepl.OriginMessage:
			default:
				dl.logger.Info("unknown message type in pgoutput stream", zap.String("message", fmt.Sprintf("%T", logicalMsg)))
			}
			// Update the client's WAL position.
			clientXLogPos = xld.WALStart + pglogrepl.LSN(len(xld.WALData))
		}
	}
}

// parseRowValues parses raw data from WAL message into a map of column names to values.
func (dl *DatabaseLayer) parseRowValues(cols []*pglogrepl.TupleDataColumn, relation *pglogrepl.RelationMessage, typeMap *pgtype.Map) map[string]interface{} {
	values := map[string]interface{}{}
	for idx, col := range cols {
		colName := relation.Columns[idx].Name

		switch col.DataType {
		case 'n': // null
		case 'u': // unchanged toast
		case 't': // text
			val, err := decodeTextColumnData(typeMap, col.Data, relation.Columns[idx].DataType)
			if err != nil {
				dl.logger.Fatal("error decoding column data", zap.Error(err))
			}
			values[colName] = val
		}
	}
	return values
}

// getRelationByID returns the relation with the given ID.
func (dl *DatabaseLayer) getRelationByID(relations map[uint32]*pglogrepl.RelationMessage, id uint32) *pglogrepl.RelationMessage {
	relation, ok := relations[id]
	if !ok {
		dl.logger.Fatal("unknown relation ID", zap.Uint32("relation_id", id))
	}
	return relation
}

// createInsertEvent creates a new StreamEvent for an INSERT message.
func (dl *DatabaseLayer) createInsertEvent(msg *pglogrepl.InsertMessage, relations map[uint32]*pglogrepl.RelationMessage, typeMap *pgtype.Map) *StreamEvent {
	relation := dl.getRelationByID(relations, msg.RelationID)

	values := dl.parseRowValues(msg.Tuple.Columns, relation, typeMap)
	dl.logger.Info("INSERT INTO "+relation.Namespace+"."+relation.RelationName, zap.Any("values", values))

	return &StreamEvent{
		Type:      StreamEventTypeInsert,
		TableName: relation.RelationName,
		Values:    values,
	}
}

// createUpdateEvent creates a new StreamEvent for an UPDATE message.
func (dl *DatabaseLayer) createUpdateEvent(msg *pglogrepl.UpdateMessage, relations map[uint32]*pglogrepl.RelationMessage, typeMap *pgtype.Map) *StreamEvent {
	relation := dl.getRelationByID(relations, msg.RelationID)

	values := dl.parseRowValues(msg.NewTuple.Columns, relation, typeMap)
	dl.logger.Info("UPDATE "+relation.Namespace+"."+relation.RelationName, zap.Any("values", values))

	return &StreamEvent{
		Type:      StreamEventTypeUpdate,
		TableName: relation.RelationName,
		Values:    values,
	}
}

// createDeleteEvent creates a new StreamEvent for a DELETE message.
func (dl *DatabaseLayer) createDeleteEvent(msg *pglogrepl.DeleteMessage, relations map[uint32]*pglogrepl.RelationMessage, typeMap *pgtype.Map) *StreamEvent {
	relation := dl.getRelationByID(relations, msg.RelationID)

	values := dl.parseRowValues(msg.OldTuple.Columns, relation, typeMap)
	dl.logger.Info("DELETE FROM "+relation.Namespace+"."+relation.RelationName, zap.Any("values", values))

	return &StreamEvent{
		Type:      StreamEventTypeDelete,
		TableName: relation.RelationName,
		Values:    values,
	}
}

// decodeTextColumnData decodes the given data from WAL message into a value based on the given data type.
func decodeTextColumnData(mi *pgtype.Map, data []byte, dataType uint32) (interface{}, error) {
	if dt, ok := mi.TypeForOID(dataType); ok {
		return dt.Codec.DecodeValue(mi, dataType, pgtype.TextFormatCode, data)
	}
	return string(data), nil
}
