package mode

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"strings"

	"github.com/umbracle/ethgo/abi"
)

//////////////////
/// Data Schema //
//////////////////

// NewDataSchemaFromJSON creates a new DataSchema instance from a JSON file at the specified path.
//
// Parameters:
//   - jsonPath (string): The path to the JSON file.
//
// Returns:
//   - (*DataSchema): A pointer to the new DataSchema instance.
func NewDataSchemaFromJSON(jsonPath string) *DataSchema {
	content, err := ioutil.ReadFile(jsonPath)
	if err != nil {
		log.Fatal("error when opening file: ", err)
	}

	var dataSchema DataSchema
	err = json.Unmarshal(content, &dataSchema)
	if err != nil {
		log.Fatal("error unmarshalling: ", err)
	}
	return &dataSchema
}

// BuildTableSchemas builds table schemas for each table in the DataSchema.
//
// Returns:
//   - (map[string]*TableSchema): A map of table schemas keyed by table name.
func (dataSchema *DataSchema) BuildTableSchemas() map[string]*TableSchema {
	tableSchemas := map[string]*TableSchema{}
	for tableName, schema := range dataSchema.ComponentValueSchema {
		tableSchema := &TableSchema{
			TableName:     tableName,
			FieldNames:    []string{},
			SolidityTypes: map[string]string{},
			PostgresTypes: map[string]string{},
		}

		// Handle the default fields.
		for fieldName, typePair := range dataSchema.ComponentDefaultSchema {
			tableSchema.FieldNames = append(tableSchema.FieldNames, fieldName)
			tableSchema.SolidityTypes[fieldName] = typePair.SolidityType
			tableSchema.PostgresTypes[fieldName] = typePair.PostgresType
		}

		// Handle all of the "value" fields.
		for fieldName, typePair := range schema {
			tableSchema.FieldNames = append(tableSchema.FieldNames, fieldName)
			tableSchema.SolidityTypes[fieldName] = typePair.SolidityType
			tableSchema.PostgresTypes[fieldName] = typePair.PostgresType
		}
		tableSchemas[tableName] = tableSchema
	}
	return tableSchemas
}

///////////////////
/// Table Schema //
///////////////////

// NamespacedTableName returns the fully-qualified table name in the format "namespace.table_name".
//
// Returns:
//   - (string): The fully-qualified table name.
func (schema *TableSchema) NamespacedTableName() string {
	return schema.Namespace + "." + schema.TableName
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
func (schema *TableSchema) GetEncodingTypes(fieldNames []string, fieldProjections map[string]string) ([]*abi.Type, []string) {
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
		solType := schema.SolidityTypes[projectedField]

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

// ToSolidityTupleString returns the Solidity tuple string for the table schema.
//
// Returns:
//   - (string): The Solidity tuple string for the table schema.
func (schema *TableSchema) ToSolidityTupleString() string {
	var tuple strings.Builder
	tuple.WriteString("tuple(")
	idx := 0
	for fieldName, solidityType := range schema.SolidityTypes {
		tuple.WriteString(solidityType + " " + fieldName)
		if idx < len(schema.SolidityTypes)-1 {
			tuple.WriteString(", ")
		}
		idx++
	}
	tuple.WriteString(")")
	return tuple.String()
}

// CombineSchemas combines multiple table schemas into a single schema with the combined table name.
//
// Parameters:
//   - schemas ([]*TableSchema): A slice of table schemas to combine.
//
// Returns:
//   - (*TableSchema): A pointer to the combined table schema.
func CombineSchemas(schemas []*TableSchema) *TableSchema {
	var combinedSchemaName strings.Builder
	for idx, schema := range schemas {
		combinedSchemaName.WriteString(schema.TableName)
		if idx < len(schemas)-1 {
			combinedSchemaName.WriteString("_")
		}
	}

	combinedSchema := &TableSchema{
		TableName:     combinedSchemaName.String(),
		FieldNames:    []string{},
		SolidityTypes: map[string]string{},
		PostgresTypes: map[string]string{},
	}
	for _, schema := range schemas {
		for fieldName, solidityType := range schema.SolidityTypes {
			combinedSchema.FieldNames = append(combinedSchema.FieldNames, fieldName)
			combinedSchema.SolidityTypes[fieldName] = solidityType
			combinedSchema.PostgresTypes[fieldName] = schema.PostgresTypes[fieldName]
		}
	}
	return combinedSchema
}
