package mode

import (
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	"strings"
)

type Table struct {
	ID        string `json:"id"`        // Table ID as it comes from chain
	Name      string `json:"name"`      // Table name
	Namespace string `json:"namespace"` // Table DB namespace

	KeyNames   []string `json:"key_names"`   // Key names. Separate from field names and are used for searching
	FieldNames []string `json:"field_names"` // Field names

	SolidityTypes map[string]string `json:"solidity_types"` // Field name -> Solidity type
	PostgresTypes map[string]string `json:"postgres_types"` // Field name -> Postgres type

	StoreCoreKeySchema   *storecore.Schema `json:"storecore_key_schema"`
	StoreCoreFieldSchema *storecore.Schema `json:"storecore_field_schema"`

	Metadata *TableMetadata `json:"metadata"` // Auxiliary data about the table.
}

type TableMetadata struct {
	ColumnMetadata     map[string]*ColumnMetadata `json:"column_metadata"`     // Field name -> Column metadata
	TableFormattedName string                     `json:"table_formated_name"` // Formatted name of the table
}

type ColumnMetadata struct {
	IsKey               bool   `json:"is_key"`
	ColumnFormattedName string `json:"column_formated_name"` // Formatted name of the column as it comes from chain
}

func (table *Table) String() string {
	var str strings.Builder
	str.WriteString("Table{")
	str.WriteString("ID: " + table.ID + ", ")
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
