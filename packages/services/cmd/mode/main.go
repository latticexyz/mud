package main

import (
	"context"
	"flag"

	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/ingress"
	"latticexyz/mud/packages/services/pkg/mode/query"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	"latticexyz/mud/packages/services/pkg/mode/write"

	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

var (
	// Configuration can be specified via a YAML file.
	configFile = flag.String("config", "", "path to config file")

	// Alternatively, the configuration can be specified via command line flags.
	chainNames    = flag.String("chain-names", "", "comma separated list of chain names")
	chainIds      = flag.String("chain-ids", "", "comma separated list of chain ids")
	chainRpcsHttp = flag.String("chain-rpcs-http", "", "comma separated list of chain rpcs (http)")
	chainRpcsWs   = flag.String("chain-rpcs-ws", "", "comma separated list of chain rpcs (ws)")
	dbDsn         = flag.String("db-dsn", "", "database dsn")
	dbWipe        = flag.Bool("db-wipe", false, "wipe database on launch")
	portQl        = flag.Int("port-ql", 0, "port for query layer")
	portMetrics   = flag.Int("port-metrics", 0, "port for metrics server")

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

	// Setup config.
	var config *mode.Config
	var err error
	if *configFile != "" {
		// Load config from file.
		config, err = mode.ConfigFromFile(*configFile, logger)
	} else {
		// Load config from command line flags.
		config, err = mode.ConfigFromFlags(*chainNames, *chainIds, *chainRpcsHttp, *chainRpcsWs, *dbDsn, *dbWipe, *portQl, *portMetrics)
	}
	if err != nil {
		logger.Fatal("failed to load config", zap.Error(err))
	}

	// While working with V1 data, 'dataSchemaPath' is used to load up the entire
	// schema information into memory so that the MODE QueryLayer knows how to
	// encode / decode the data.
	dataSchema := mode.NewDataSchemaFromJSON(*dataSchemaPath)
	tableSchemas := dataSchema.BuildTableSchemas()

	for tableName, tableSchema := range tableSchemas {
		logger.Info("table schema", zap.String("table", tableName), zap.Any("schema", tableSchema))
	}

	// Run MODE metrics server.
	go grpc.StartMetricsServer(config.Metrics.Port, logger)

	// Run the MODE DatabaseLayer.
	dl := db.NewDatabaseLayer(context.Background(), config.Db.Dsn, config.Db.Wipe, logger)
	go dl.RunDatabaseLayer(context.Background())

	// Create a MODE WriteLayer for modifying the database.
	wl := write.New(dl, logger)

	// Create a SchemaCache for storing + retrieving table schemas.
	schemaCache := schema.NewCache(dl, config.Chains, logger)

	// Run the MODE IngressLayers for every chain that is being indexed by MODE.
	for _, chain := range config.Chains {
		il := ingress.New(&chain, wl, schemaCache, logger)
		go il.Run()
	}

	// Run the MODE QueryLayer.
	ql := query.NewQueryLayer(dl, schemaCache, tableSchemas, logger)
	query.RunQueryLayer(ql, config.Ql.Port)
}
