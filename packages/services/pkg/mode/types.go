package mode

type TableSchema struct {
	TableName     string
	FieldNames    []string
	SolidityTypes map[string]string // Field name -> Solidity type
	PostgresTypes map[string]string // Field name -> Postgres type
}

type DataSchemaTypePair struct {
	SolidityType string `json:"solidity"`
	PostgresType string `json:"postgres"`
}

type DataSchema struct {
	ComponentMapping             map[string]string                        `json:"component_keccak_mapping"`
	ComponentValueSchema         map[string]map[string]DataSchemaTypePair `json:"component_value_schema"`
	ComponentSolidityTypeMapping map[string]string                        `json:"component_solidity_type_mapping"`
	ComponentDefaultSchema       map[string]DataSchemaTypePair            `json:"component_default_schema"`
}
