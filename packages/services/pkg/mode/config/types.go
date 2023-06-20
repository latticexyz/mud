package config

// RpcConfig defines the configuration for an RPC endpoint.
type RPCConfig struct {
	HTTP string `yaml:"http"`
	WS   string `yaml:"ws"`
}

// ChainConfig defines the configuration for a chain.
type ChainConfig struct {
	Name string    `yaml:"name"`
	ID   string    `yaml:"id"`
	RPC  RPCConfig `yaml:"rpc"`
}

// DBConfig defines the configuration for a database.
type DBConfig struct {
	Name string `yaml:"name"`
	Host string `yaml:"host"`
	Port uint64 `yaml:"port"`
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
	DB      DBConfig      `yaml:"db"`
	Sync    SyncConfig    `yaml:"sync"`
	Ql      QlConfig      `yaml:"ql"`
	Metrics MetricsConfig `yaml:"metrics"`
}
