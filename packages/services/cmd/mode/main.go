package main

import (
	"context"
	"flag"
	"math/big"

	"latticexyz/mud/packages/services/pkg/grpc"
	"latticexyz/mud/packages/services/pkg/logger"
	mode_config "latticexyz/mud/packages/services/pkg/mode/config"
	"latticexyz/mud/packages/services/pkg/mode/db"
	"latticexyz/mud/packages/services/pkg/mode/ingress"
	"latticexyz/mud/packages/services/pkg/mode/query"
	"latticexyz/mud/packages/services/pkg/mode/read"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	"latticexyz/mud/packages/services/pkg/mode/write"

	_ "github.com/lib/pq"
	"go.uber.org/zap"
)

var (
	// Configuration can be specified via a YAML file.
	configFile = flag.String("config", "", "path to config file")

	// Alternatively, the configuration can be specified via command line flags.
	chainNames          = flag.String("chain-names", "", "comma separated list of chain names")
	chainIds            = flag.String("chain-ids", "", "comma separated list of chain ids")
	chainRpcsHttp       = flag.String("chain-rpcs-http", "", "comma separated list of chain rpcs (http)")
	chainRpcsWs         = flag.String("chain-rpcs-ws", "", "comma separated list of chain rpcs (ws)")
	dbDsn               = flag.String("db-dsn", "", "database dsn")
	dbWipe              = flag.Bool("db-wipe", false, "wipe database on launch")
	syncEnabled         = flag.Bool("sync-enabled", false, "enable syncing")
	syncStartBlock      = flag.Uint64("sync-start-block", 0, "start block for syncing")
	syncBlockBatchCount = flag.Uint64("sync-block-batch-count", 0, "number of blocks to sync in a batch")
	portQl              = flag.Int("port-ql", 0, "port for query layer")
	portMetrics         = flag.Int("port-metrics", 0, "port for metrics server")
)

func main() {
	// Parse command line flags.
	flag.Parse()

	// Setup logging.
	logger.InitLogger()
	logger := logger.GetLogger()
	defer logger.Sync()

	// Setup config.
	var config *mode_config.Config
	var err error
	if *configFile != "" {
		// Load config from file.
		config, err = mode_config.FromFile(*configFile, logger)
	} else {
		// Load config from command line flags.
		config, err = mode_config.FromFlags(
			*chainNames,
			*chainIds,
			*chainRpcsHttp,
			*chainRpcsWs,
			*dbDsn,
			*dbWipe,
			*syncEnabled,
			*syncStartBlock,
			*syncBlockBatchCount,
			*portQl,
			*portMetrics,
		)
	}
	if err != nil {
		logger.Fatal("failed to load config", zap.Error(err))
	}

	// Run MODE metrics server.
	go grpc.StartMetricsServer(config.Metrics.Port, logger)

	// Run the MODE DatabaseLayer.
	dl := db.NewDatabaseLayer(context.Background(), config.Db.Dsn, config.Db.Wipe, logger)
	go dl.RunDatabaseLayer(context.Background())

	// Create a MODE WriteLayer for modifying the database.
	wl := write.New(dl, logger)

	// Create a MODE ReadLayer for reading from the database.
	rl := read.New(dl, logger)

	// Create a SchemaCache for storing + retrieving table schemas.
	schemaCache := schema.NewCache(dl, config.Chains, logger)

	// Run the MODE IngressLayers for every chain that is being indexed by MODE.
	for _, chain := range config.Chains {
		il := ingress.New(&chain, &config.Sync, wl, rl, schemaCache, logger)

		// If sync is enabled, start syncing from the specified start block.
		if config.Sync.Enabled {
			go il.Sync(big.NewInt(int64(config.Sync.StartBlock)), nil)
		}

		go il.Run()
	}

	// Run the MODE QueryLayer.
	ql := query.NewQueryLayer(dl, rl, schemaCache, logger)
	query.RunQueryLayer(ql, config.Ql.Port)
}
