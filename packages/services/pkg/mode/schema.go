package mode

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"strings"

	"github.com/umbracle/ethgo/abi"
)

///
/// Data Schema
///

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

///
/// Table Schema
///

func (schema *TableSchema) FullTableName() string {
	return schema.Namespace + "." + schema.TableName
}

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
		_type := abi.MustNewType(schema.SolidityTypes[projectedField])
		_types = append(_types, _type)
		_typesStr = append(_typesStr, _type.String())
	}
	return _types, _typesStr
}

func (schema *TableSchema) GetEncodingTypesAll(fieldProjections map[string]string) ([]*abi.Type, []string) {
	return schema.GetEncodingTypes(schema.FieldNames, fieldProjections)
}

// TODO: a version of this function is useful when sending over "raw" values.
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

func GetSchemasForTables(tableNames []string, tableSchemas map[string]*TableSchema) []*TableSchema {
	schemas := []*TableSchema{}
	for _, tableName := range tableNames {
		schemas = append(schemas, tableSchemas[tableName])
	}
	return schemas
}

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
