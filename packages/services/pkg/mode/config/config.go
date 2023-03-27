// Package config provides a configuration struct and utility functions for parsing
// and validating application configuration.
package config

import (
	"fmt"
	"os"
	"strings"

	"go.uber.org/zap"
	"gopkg.in/yaml.v3"
)

// RpcConfig defines the configuration for an RPC endpoint.
type RpcConfig struct {
	Http string `yaml:"http"`
	Ws   string `yaml:"ws"`
}

// ChainConfig defines the configuration for a chain.
type ChainConfig struct {
	Name string    `yaml:"name"`
	Id   string    `yaml:"id"`
	Rpc  RpcConfig `yaml:"rpc"`
}

// DbConfig defines the configuration for a database.
type DbConfig struct {
	Dsn  string `yaml:"dsn"`
	Wipe bool   `yaml:"wipe"`
}

// SyncConfig defines the configuration for the synchronization process.
type SyncConfig struct {
	Enabled         bool   `yaml:"enabled"`
	StartBlock      uint64 `yaml:"startBlock"`
	BlockBatchCount uint64 `yaml:"blockBatchCount"`
}

// QlConfig defines the configuration for the query layer.
type QlConfig struct {
	Port int `yaml:"port"`
}

// MetricsConfig defines the configuration for the metrics endpoint.
type MetricsConfig struct {
	Port int `yaml:"port"`
}

// Config defines the application configuration.
type Config struct {
	Chains  []ChainConfig `yaml:"chains"`
	Db      DbConfig      `yaml:"db"`
	Sync    SyncConfig    `yaml:"sync"`
	Ql      QlConfig      `yaml:"ql"`
	Metrics MetricsConfig `yaml:"metrics"`
}

// FromFile parses the configuration from a file.
func FromFile(configFile string, logger *zap.Logger) (*Config, error) {
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
	chainNames, chainIds, chainRpcsHttp, chainRpcsWs, dbDsn string,
	dbWipe bool,
	syncEnabled bool,
	syncStartBlock, syncBlockBatchCount uint64,
	portQl, portMetrics int,
) (*Config, error) {
	config := &Config{
		Chains: make([]ChainConfig, 0),
		Db: DbConfig{
			Dsn:  dbDsn,
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
	if chainNames == "" || chainIds == "" || chainRpcsHttp == "" || chainRpcsWs == "" {
		return nil, fmt.Errorf("chain parameters cannot be empty")
	}

	// Parse chain names.
	chainNamesList := strings.Split(chainNames, ",")
	chainIdsList := strings.Split(chainIds, ",")
	chainRpcsHttpList := strings.Split(chainRpcsHttp, ",")
	chainRpcsWsList := strings.Split(chainRpcsWs, ",")

	// Create chain configs and add them to the config.
	for i, chainName := range chainNamesList {
		chainId := chainIdsList[i]
		chainRpcHttp := chainRpcsHttpList[i]
		chainRpcWs := chainRpcsWsList[i]

		chainConfig := ChainConfig{
			Name: chainName,
			Id:   chainId,
			Rpc: RpcConfig{
				Http: chainRpcHttp,
				Ws:   chainRpcWs,
			},
		}
		config.Chains = append(config.Chains, chainConfig)
	}
	return config, nil
}
