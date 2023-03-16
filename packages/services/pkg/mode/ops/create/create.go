package create

import (
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

type CreateBuilder struct {
	Request     *pb_mode.CreateRequest
	TableSchema *mode.TableSchema
}

func NewCreateBuilder(request *pb_mode.CreateRequest, tableSchema *mode.TableSchema) *CreateBuilder {
	return &CreateBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

func (builder *CreateBuilder) Validate() error {
	return nil
}

func (builder *CreateBuilder) BuildCreateTableKeyFields() string {
	schema := builder.TableSchema

	if len(schema.KeyNames) == 0 {
		return ""
	}
	keyFields := ""
	for idx, field := range schema.KeyNames {
		postgresType := schema.PostgresTypes[field]
		keyFields = keyFields + field + ` ` + postgresType
		if field == schema.PrimaryKey {
			keyFields = keyFields + ` PRIMARY KEY`
		}
		if idx != len(schema.KeyNames)-1 {
			keyFields = keyFields + `, `
		}
	}
	return keyFields
}

func (builder *CreateBuilder) BuildCreateTableValueFields() string {
	schema := builder.TableSchema

	if len(schema.FieldNames) == 0 {
		return ""
	}
	valueFields := ""
	for idx, field := range schema.FieldNames {
		postgresType := schema.PostgresTypes[field]
		valueFields = valueFields + field + ` ` + postgresType
		if field == schema.PrimaryKey {
			valueFields = valueFields + ` PRIMARY KEY`
		}
		if idx != len(schema.FieldNames)-1 {
			valueFields = valueFields + `, `
		}
	}
	return valueFields
}

func (builder *CreateBuilder) BuildCreateTableFields() string {
	var str strings.Builder
	keyFields := builder.BuildCreateTableKeyFields()
	valueFields := builder.BuildCreateTableValueFields()
	if keyFields != "" {
		str.WriteString(keyFields + ",")
	}
	if valueFields != "" {
		str.WriteString(valueFields)
	}
	return str.String()
}

func (builder *CreateBuilder) BuildCreate() string {
	return `CREATE TABLE IF NOT EXISTS ` + builder.TableSchema.FullTableName() + ` (
	` + builder.BuildCreateTableFields() + `
	);`
}

func (builder *CreateBuilder) BuildIndex() string {
	var indexStr strings.Builder
	for _, field := range builder.TableSchema.FieldNames {
		indexStr.WriteString(`CREATE INDEX IF NOT EXISTS ` + builder.TableSchema.TableName + `_` + field + `_idx ON ` + builder.TableSchema.FullTableName() + `("` + field + `");`)
	}
	return indexStr.String()
}

func (builder *CreateBuilder) BuildIndentityFullModifier() string {
	return "ALTER TABLE " + builder.TableSchema.FullTableName() + " REPLICA IDENTITY FULL;"
}

func (builder *CreateBuilder) ToSQLQueries() (string, string, error) {
	err := builder.Validate()
	if err != nil {
		return "", "", err
	}
	return builder.BuildCreate(), builder.BuildIndex(), nil
}
