// Package config provides a configuration struct and utility functions for parsing
// and validating application configuration.
package config

import (
	"fmt"
	"os"
	"strings"

	"gopkg.in/yaml.v3"
)

// FromFile parses the configuration from a file.
func FromFile(configFile string) (*Config, error) {
	config := &Config{}
	data, err := os.ReadFile(configFile)
	if err != nil {
		return nil, fmt.Errorf("could not read config file: %w", err)
	}

	err = yaml.Unmarshal(data, config)
	if err != nil {
		return nil, fmt.Errorf("could not parse config file: %w", err)
	}
	return config, nil
}

// FromFlags parses the configuration from command-line flags.
func FromFlags(
	chainNames, chainIds, chainRPCsHTTP, chainRPCsWS, dbName, dbHost string,
	dbPort uint64,
	dbWipe bool,
	syncEnabled bool,
	syncStartBlock, syncBlockBatchCount uint64,
	portQl, portMetrics int,
) (*Config, error) {
	config := &Config{
		Chains: make([]ChainConfig, 0),
		DB: DBConfig{
			Name: dbName,
			Host: dbHost,
			Port: dbPort,
			Wipe: dbWipe,
		},
		Sync: SyncConfig{
			Enabled:         syncEnabled,
			StartBlock:      syncStartBlock,
			BlockBatchCount: syncBlockBatchCount,
		},
		Ql: QlConfig{
			Port: portQl,
		},
		Metrics: MetricsConfig{
			Port: portMetrics,
		},
	}
	// Validate chain parameters.
	if chainNames == "" || chainIds == "" || chainRPCsHTTP == "" || chainRPCsWS == "" {
		return nil, fmt.Errorf("chain parameters cannot be empty")
	}

	// Parse chain names.
	chainNamesList := strings.Split(chainNames, ",")
	chainIdsList := strings.Split(chainIds, ",")
	chainRPCsHTTPList := strings.Split(chainRPCsHTTP, ",")
	chainRPCsWSList := strings.Split(chainRPCsWS, ",")

	// Create chain configs and add them to the config.
	for i, chainName := range chainNamesList {
		chainId := chainIdsList[i]
		chainRPCHTTP := chainRPCsHTTPList[i]
		chainRPCWS := chainRPCsWSList[i]

		chainConfig := ChainConfig{
			Name: chainName,
			Id:   chainId,
			RPC: RPCConfig{
				HTTP: chainRPCHTTP,
				WS:   chainRPCWS,
			},
		}
		config.Chains = append(config.Chains, chainConfig)
	}
	return config, nil
}
