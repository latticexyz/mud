package mode

import (
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	"strings"
)

type DataSchemaTypePair struct {
	SolidityType string `json:"solidity"`
	PostgresType string `json:"postgres"`
}

type TableSchema struct {
	TableId    string   `json:"id"`   // Table ID as it comes from chain.
	TableName  string   `json:"name"` // Table name is table ID but with naming adjustments to work with the database.
	FieldNames []string `json:"field_names"`
	KeyNames   []string `json:"key_names"` // Key names are separte from field names and are used for searching.

	SolidityTypes map[string]string `json:"solidity_types"` // Field name -> Solidity type
	PostgresTypes map[string]string `json:"postgres_types"` // Field name -> Postgres type

	IsKey map[string]bool `json:"is_key"` // Field name -> Is key?

	// Auxiliary data about the table.
	Namespace             string                  `json:"namespace"`
	StoreCoreSchemaTypeKV *storecore.SchemaTypeKV `json:"store_core_schema_type_kv"`
	PrimaryKey            string                  `json:"primary_key"`
	OnChainReadableName   string                  `json:"on_chain_readable_name"`
	OnChainColNames       map[string]string       `json:"on_chain_col_names"`
}

type DataSchema struct {
	ComponentMapping             map[string]string                        `json:"component_keccak_mapping"`
	ComponentValueSchema         map[string]map[string]DataSchemaTypePair `json:"component_value_schema"`
	ComponentSolidityTypeMapping map[string]string                        `json:"component_solidity_type_mapping"`
	ComponentDefaultSchema       map[string]DataSchemaTypePair            `json:"component_default_schema"`
}

func (t *TableSchema) String() string {
	var str strings.Builder
	str.WriteString("TableSchema{")
	str.WriteString("TableId: " + t.TableId + ", ")
	str.WriteString("TableName: " + t.TableName + ", ")
	str.WriteString("FieldNames: " + strings.Join(t.FieldNames, ", ") + ", ")
	str.WriteString("KeyNames: " + strings.Join(t.KeyNames, ", ") + ", ")
	str.WriteString("SolidityTypes: {")
	for k, v := range t.PostgresTypes {
		str.WriteString(k + ": " + v + ", ")
	}
	str.WriteString("}, ")
	str.WriteString("PostgresTypes: {")
	for k, v := range t.PostgresTypes {
		str.WriteString(k + ": " + v + ", ")
	}
	str.WriteString("}, ")
	str.WriteString("Namespace: " + t.Namespace + ", ")
	return str.String()
}
