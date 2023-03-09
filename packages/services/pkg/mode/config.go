package mode

type RpcConfig struct {
	Http string `yaml:"http"`
	Ws   string `yaml:"ws"`
}

type ChainConfig struct {
	Name string    `yaml:"name"`
	Id   string    `yaml:"id"`
	Rpc  RpcConfig `yaml:"rpc"`
}

type DbConfig struct {
	Dsn string `yaml:"dsn"`
}

type QlConfig struct {
	Port int `yaml:"port"`
}

type MetricsConfig struct {
	Port int `yaml:"port"`
}

type Config struct {
	Chains  []ChainConfig `yaml:"chains"`
	Db      DbConfig      `yaml:"db"`
	Ql      QlConfig      `yaml:"ql"`
	Metrics MetricsConfig `yaml:"metrics"`
}
