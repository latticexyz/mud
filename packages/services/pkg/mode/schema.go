package mode

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"strings"

	"github.com/umbracle/ethgo/abi"
)

// func GetAllTables() ([]string, error) {
// 	var tableNames []string

// 	rows, err := manager.db.Query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
// 	if err != nil {
// 		return tableNames, err
// 	}
// 	defer rows.Close()

// 	for rows.Next() {
// 		var tableName string
// 		err := rows.Scan(&tableName)
// 		if err != nil {
// 			log.Fatal(err)
// 		}
// 		tableNames = append(tableNames, tableName)
// 	}
// 	if err := rows.Err(); err != nil {
// 		return tableNames, err
// 	}

// 	return tableNames, nil
// }

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

func (schema *TableSchema) GetEncodingTypes(fieldNames []string) ([]*abi.Type, []string) {
	_types := []*abi.Type{}
	_typesStr := []string{}
	for _, fieldName := range fieldNames {
		_type := abi.MustNewType(schema.SolidityTypes[fieldName])
		_types = append(_types, _type)
		_typesStr = append(_typesStr, _type.String())
	}
	return _types, _typesStr
}

func (schema *TableSchema) GetEncodingTypesAll() ([]*abi.Type, []string) {
	return schema.GetEncodingTypes(schema.FieldNames)
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
