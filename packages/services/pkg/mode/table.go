package mode

import (
	"latticexyz/mud/packages/services/pkg/mode/storecore"
	"strings"

	"github.com/umbracle/ethgo/abi"
)

func NewTable(
	tableId string,
	tableName string,
	chainId string,
	worldAddress string,
	keyNames []string,
	fieldNames []string,
	solidityTypes map[string]string,
	postgresTypes map[string]string,
	keySchema *storecore.Schema,
	fieldsSchema *storecore.Schema,
) *Table {
	return &Table{
		Id:   tableId,
		Name: tableName,
		// Create a postgres namespace ('schema') for the world address + the chain (if it doesn't already exist).
		Namespace:            Namespace(chainId, worldAddress),
		KeyNames:             keyNames,
		FieldNames:           fieldNames,
		SolidityTypes:        solidityTypes,
		PostgresTypes:        postgresTypes,
		StoreCoreKeySchema:   keySchema,
		StoreCoreFieldSchema: fieldsSchema,
		// Metadata.
		Metadata: &TableMetadata{
			ColumnMetadata: make(map[string]*ColumnMetadata),
		},
	}
}

func NewEmptyTable(
	tableId string,
	tableName string,
	chainId string,
	worldAddress string,
) *Table {
	return &Table{
		Id:   tableId,
		Name: tableName,
		// Create a postgres namespace ('schema') for the world address + the chain (if it doesn't already exist).
		Namespace:            Namespace(chainId, worldAddress),
		KeyNames:             []string{},
		FieldNames:           []string{},
		SolidityTypes:        map[string]string{},
		PostgresTypes:        map[string]string{},
		StoreCoreKeySchema:   nil,
		StoreCoreFieldSchema: nil,
		// Metadata.
		Metadata: &TableMetadata{
			ColumnMetadata: make(map[string]*ColumnMetadata),
		},
	}
}

// NamespacedTableName returns the fully-qualified table name in the format "namespace.table_name".
//
// Returns:
//   - (string): The fully-qualified table name.
func (table *Table) NamespacedName() string {
	return table.Namespace + `."` + table.Name + `"`
}

// GetEncodingTypes returns the encoding types for the specified field names and projections.
//
// Parameters:
//   - fieldNames ([]string): A slice of field names.
//   - fieldProjections (map[string]string): A map of field projections.
//
// Returns:
//   - ([]*abi.Type): A slice of encoding types.
//   - ([]string): A slice of encoding type strings.
func (table *Table) GetEncodingTypes(fieldNames []string, fieldProjections map[string]string) ([]*abi.Type, []string) {
	_types := []*abi.Type{}
	_typesStr := []string{}
	for _, fieldName := range fieldNames {
		var projectedField string
		// If the field is projected, use the projected field name, otherwise use the original field name.
		if fieldProjections[fieldName] != "" {
			projectedField = fieldProjections[fieldName]
		} else {
			projectedField = fieldName
		}
		solType := table.SolidityTypes[projectedField]

		// Create the Type object for the type. If the type is an array, we need to wrap it in a tuple.
		var _type *abi.Type
		if strings.Contains(solType, "[]") {
			_type = abi.MustNewType("tuple(" + solType + " cols)")
		} else {
			_type = abi.MustNewType(solType)
		}

		_types = append(_types, _type)
		_typesStr = append(_typesStr, _type.String())
	}
	return _types, _typesStr
}

func (table *Table) SetKeyNames(keyNames []string) {
	table.KeyNames = keyNames
}

func (table *Table) SetFieldNames(fieldNames []string) {
	table.FieldNames = fieldNames
}

func (table *Table) SetStoreCoreKeySchema(keySchema *storecore.Schema) {
	table.StoreCoreKeySchema = keySchema
}

func (table *Table) SetStoreCoreFieldSchema(fieldsSchema *storecore.Schema) {
	table.StoreCoreFieldSchema = fieldsSchema
}

func (table *Table) SetIsKey(colName string, isKey bool) {
	table.Metadata.SetIsKey(colName, isKey)
}

func (table *Table) SetSolidityType(colName string, schemaType storecore.SchemaType) {
	table.SolidityTypes[colName] = schemaType.ToSolidityType()
}

func (table *Table) SetPostgresType(colName string, schemaType storecore.SchemaType) {
	table.PostgresTypes[colName] = schemaType.ToPostgresType()
}

func (table *Table) SetColumnFormattedName(colName string, colFormattedName string) {
	table.Metadata.SetColumnFormattedName(colName, colFormattedName)
}

func (table *Table) SetTableFormattedName(tableFormattedName string) {
	table.Metadata.SetTableFormattedName(tableFormattedName)
}

func (table *Table) GetIsKey(colName string) bool {
	return table.Metadata.GetIsKey(colName)
}

func (table *Table) GetPostgresType(colName string) string {
	return table.PostgresTypes[colName]
}

func (table *Table) GetSolidityType(colName string) string {
	return table.SolidityTypes[colName]
}

func (table *Table) GetColumnFormattedName(colName string) string {
	return table.Metadata.GetColumnFormattedName(colName)
}

func (table *Table) GetTableFormattedName() string {
	return table.Metadata.GetTableFormattedName()
}

func (metadata *TableMetadata) SetIsKey(name string, isKey bool) {
	_, ok := metadata.ColumnMetadata[name]
	if !ok {
		metadata.ColumnMetadata[name] = &ColumnMetadata{}
	}
	metadata.ColumnMetadata[name].IsKey = isKey
}

func (metadata *TableMetadata) SetColumnFormattedName(name string, colFormattedName string) {
	_, ok := metadata.ColumnMetadata[name]
	if !ok {
		metadata.ColumnMetadata[name] = &ColumnMetadata{}
	}
	metadata.ColumnMetadata[name].ColumnFormattedName = colFormattedName
}

func (metadata *TableMetadata) SetTableFormattedName(tableFormattedName string) {
	metadata.TableFormattedName = tableFormattedName
}

func (metadata *TableMetadata) GetIsKey(name string) bool {
	val, ok := metadata.ColumnMetadata[name]
	if !ok {
		return false
	}
	return val.IsKey
}

func (metadata *TableMetadata) GetColumnFormattedName(name string) string {
	val, ok := metadata.ColumnMetadata[name]
	if !ok {
		return ""
	}
	return val.ColumnFormattedName
}

func (metadata *TableMetadata) GetTableFormattedName() string {
	return metadata.TableFormattedName
}
