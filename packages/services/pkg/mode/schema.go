package mode

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"strings"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/jmoiron/sqlx"
	"github.com/umbracle/ethgo/abi"
	"go.uber.org/zap"
)

type SchemaManager struct {
	eth    *ethclient.Client
	db     *sqlx.DB
	logger *zap.Logger

	tableToSoliditySchema map[string]Schema
}

type SchemaType uint

// TODO: how to avoid duplicating solidity-side schema work?
const (
	None SchemaType = iota
	Uint8
	Uint16
	Uint32
	Uint128
	Uint256
	Bytes4
	Uint32Array
	Bytes24Array
	String
	Address
	AddressArray
)

type SchemaPair struct {
	field_name string
	field_type string
}

type Schema struct {
	types []SchemaPair
}

func NewSchemaManager(eth *ethclient.Client, db *sqlx.DB, logger *zap.Logger, schemaDataPath string) *SchemaManager {
	return &SchemaManager{
		eth:                   eth,
		db:                    db,
		logger:                logger,
		tableToSoliditySchema: BuildTableSoliditySchema(ParseDataSchemaFile(schemaDataPath)),
	}
}

type DataSchema struct {
	ComponentMapping             map[string]string            `json:"component_keccak_mapping"`
	ComponentValueSchema         map[string]map[string]string `json:"component_value_schema"`
	ComponentValueSchemaSolidity map[string]map[string]string `json:"component_value_schema_solidity"`
	ComponentSolidityTypeMapping map[string]string            `json:"component_solidity_type_mapping"`
}

func ParseDataSchemaFile(path string) DataSchema {
	content, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal("error when opening file: ", err)
	}

	var dataSchema DataSchema
	err = json.Unmarshal(content, &dataSchema)
	if err != nil {
		log.Fatal("error unmarshalling: ", err)
	}
	return dataSchema
}

func BuildTableSoliditySchema(dataSchema DataSchema) map[string]Schema {
	tableSchemas := map[string]Schema{}
	for tableName, schema := range dataSchema.ComponentValueSchemaSolidity {
		types := []SchemaPair{}
		for field := range schema {
			fieldType := schema[field]
			types = append(types, SchemaPair{
				field_name: field,
				field_type: fieldType,
			})
		}
		tableSchemas[tableName] = Schema{
			types: types,
		}
	}
	return tableSchemas
}

func (manager *SchemaManager) SchemaToTypeList(schema *Schema) ([]*abi.Type, []string, error) {
	_types := []*abi.Type{}
	_typesStr := []string{}

	// Add the "default" types from schema, e.g. "entityid".
	_types = append(_types, abi.MustNewType("uint256"))
	_typesStr = append(_typesStr, abi.MustNewType("uint256").String())

	for _, _type := range schema.types {
		_type := abi.MustNewType(_type.field_type)
		_types = append(_types, _type)
		_typesStr = append(_typesStr, _type.String())
	}

	return _types, _typesStr, nil
}

func (manager *SchemaManager) SchemaToType(schema *Schema) (*abi.Type, string, error) {
	if len(schema.types) == 0 {
		return nil, "", fmt.Errorf("no types in schema")
	}
	if len(schema.types) == 1 {
		_type := abi.MustNewType(schema.types[0].field_type)
		return _type, _type.String(), nil
	}
	var tuple strings.Builder
	tuple.WriteString("tuple(")
	for idx, _type := range schema.types {
		tuple.WriteString(_type.field_type + " " + _type.field_name)
		if idx < len(schema.types)-1 {
			tuple.WriteString(", ")
		}
	}
	tuple.WriteString(")")
	println(tuple.String())

	_type := abi.MustNewType(tuple.String())
	return _type, _type.String(), nil
}

func (manager *SchemaManager) GetSoliditySchema(tableName string) *Schema {
	// TODO actual schema fetch with a call via ethclient.
	// Also, consider saving schemas locally in MODE DB instead of having to re-fetch.
	schema := manager.tableToSoliditySchema[tableName]
	return &schema
}

func (manager *SchemaManager) GetAllTables() ([]string, error) {
	var tableNames []string

	rows, err := manager.db.Query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
	if err != nil {
		return tableNames, err
	}
	defer rows.Close()

	for rows.Next() {
		var tableName string
		err := rows.Scan(&tableName)
		if err != nil {
			log.Fatal(err)
		}
		tableNames = append(tableNames, tableName)
	}
	if err := rows.Err(); err != nil {
		return tableNames, err
	}

	return tableNames, nil
}
