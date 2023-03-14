package mode

import "latticexyz/mud/packages/services/pkg/mode/storecore"

type DataSchemaTypePair struct {
	SolidityType string `json:"solidity"`
	PostgresType string `json:"postgres"`
}

type TableSchema struct {
	TableName     string            `json:"name"`
	FieldNames    []string          `json:"field_names"`
	SolidityTypes map[string]string `json:"solidity_types"` // Field name -> Solidity type
	PostgresTypes map[string]string `json:"postgres_types"` // Field name -> Postgres type

	// Auxiliary data about the table.
	Namespace             string                  `json:"namespace"`
	StoreCoreSchemaTypeKV *storecore.SchemaTypeKV `json:"store_core_schema_type_kv"`
	PrimaryKey            string                  `json:"primary_key"`
	ReadableName          string                  `json:"readable_name"`
}

type DataSchema struct {
	ComponentMapping             map[string]string                        `json:"component_keccak_mapping"`
	ComponentValueSchema         map[string]map[string]DataSchemaTypePair `json:"component_value_schema"`
	ComponentSolidityTypeMapping map[string]string                        `json:"component_solidity_type_mapping"`
	ComponentDefaultSchema       map[string]DataSchemaTypePair            `json:"component_default_schema"`
}
