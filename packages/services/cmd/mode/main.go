package main

import (
	"flag"

	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/mode"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

var (
	// General flags.
	dsn   = flag.String("dsn", "postgresql://localhost:5432/mode?sslmode=disable", "Connection string to Postgres")
	wsUrl = flag.String("ws-url", "ws://localhost:8545", "Websocket Url")

	// Ports.
	port        = flag.Int("port", 50091, "gRPC Server Port")
	metricsPort = flag.Int("metrics-port", 6060, "Prometheus metrics http handler port. Defaults to port 6060")

	// TODO: remove when ready for V2.
	dataSchemaPath = flag.String("schema-path", "./OPCraftDataSchema.json", "A schema file is required when working with V1 data")
)

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

func main() {
	// Parse command line flags.
	flag.Parse()

	// Setup logging.
	logger.InitLogger()
	logger := logger.GetLogger()
	defer logger.Sync()

	// Connect to the MODE database.
	db, err := connectToDatabase(*dsn)
	if err != nil {
		logger.Fatal("error connecting to db", zap.Error(err))
	}

	// Connect to an Ethereum execution client.
	eth := eth.GetEthereumClient(*wsUrl, logger)

	// Schema manager is responsible for all matters regarding the structure
	// of the data in DB <-> as it's represented on-chain.
	//
	// While working with V1 data, 'dataSchemaPath' is used to load up the entire
	// schema information into memory so that the MODE QueryLayer knows how to
	// encode / decode the data.
	schemaManager := mode.NewSchemaManager(eth, db, logger, *dataSchemaPath)

	// Start gRPC server.
	grpc.StartMODEServer(*port, *metricsPort, eth, db, schemaManager, logger)
}
