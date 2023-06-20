package mode

import (
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	"strings"
)

type Table struct {
	Id         string   `json:"id"`          // Table ID as it comes from chain.
	Name       string   `json:"name"`        // Table name.
	KeyNames   []string `json:"key_names"`   // Key names. Separate from field names and are used for searching.
	FieldNames []string `json:"field_names"` // Field names.

	SolidityTypes map[string]string `json:"solidity_types"` // Field name -> Solidity type
	PostgresTypes map[string]string `json:"postgres_types"` // Field name -> Postgres type

	IsKey map[string]bool `json:"is_key"` // Field name -> Is key?

	StoreCoreKeySchema   *storecore.Schema `json:"storecore_key_schema"`
	StoreCoreFieldSchema *storecore.Schema `json:"storecore_field_schema"`

	// Auxiliary data about the table.
	Namespace           string            `json:"namespace"`
	PrimaryKey          string            `json:"primary_key"`
	OnChainReadableName string            `json:"on_chain_readable_name"`
	OnChainColNames     map[string]string `json:"on_chain_col_names"`
}

func (table *Table) String() string {
	var str strings.Builder
	str.WriteString("Table{")
	str.WriteString("Id: " + table.Id + ", ")
	str.WriteString("Name: " + table.Name + ", ")
	str.WriteString("KeyNames: " + strings.Join(table.KeyNames, ", ") + ", ")
	str.WriteString("FieldNames: " + strings.Join(table.FieldNames, ", ") + ", ")
	str.WriteString("SolidityTypes: {")
	for k, v := range table.PostgresTypes {
		str.WriteString(k + ": " + v + ", ")
	}
	str.WriteString("}, ")
	str.WriteString("PostgresTypes: {")
	for k, v := range table.PostgresTypes {
		str.WriteString(k + ": " + v + ", ")
	}
	str.WriteString("}, ")
	str.WriteString("Namespace: " + table.Namespace + ", ")
	str.WriteString("}")
	return str.String()
}

type TableRow map[string]interface{}
