package main

import (
	"context"
	"flag"

	"latticexyz/mud/packages/services/pkg/eth"
	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/query"

	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

var (
	// General flags.
	dsn   = flag.String("dsn", "postgresql://localhost:5432/mode?sslmode=disable&replication=database", "Connection string to Postgres")
	wsUrl = flag.String("ws-url", "ws://localhost:8545", "Websocket Url")

	// Ports.
	qlPort      = flag.Int("ql-port", 50091, "MODE QueryLayer port")
	metricsPort = flag.Int("metrics-port", 6060, "MODE Prometheus Metrics port. Defaults to port 6060")

	// TODO: remove when ready for V2.
	dataSchemaPath = flag.String("schema-path", "./OPCraftDataSchema.json", "A schema file is required when working with V1 data")
)

func main() {
	// Parse command line flags.
	flag.Parse()

	// Setup logging.
	logger.InitLogger()
	logger := logger.GetLogger()
	defer logger.Sync()

	// Connect to an Ethereum execution client.
	eth := eth.GetEthereumClient(*wsUrl, logger)

	// While working with V1 data, 'dataSchemaPath' is used to load up the entire
	// schema information into memory so that the MODE QueryLayer knows how to
	// encode / decode the data.
	dataSchema := mode.NewDataSchemaFromJSON(*dataSchemaPath)
	tableSchemas := dataSchema.BuildTableSchemas()

	for tableName, tableSchema := range tableSchemas {
		logger.Info("table schema", zap.String("table", tableName), zap.Any("schema", tableSchema))
	}

	// Run MODE metrics server.
	go grpc.StartMetricsServer(*metricsPort, logger)

	// Run the MODE DatabaseLayer.
	dl := db.NewDatabaseLayer(context.Background(), *dsn, logger)
	go dl.RunDatabaseLayer(context.Background())

	// Run the MODE QueryLayer.
	ql := query.NewQueryLayer(eth, dl, tableSchemas, logger)
	query.RunQueryLayer(ql, *qlPort)
}
