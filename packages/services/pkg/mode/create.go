package mode

import (
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

type CreateBuilder struct {
	Request     *mode.CreateRequest
	TableSchema *TableSchema
}

func NewCreateBuilder(request *mode.CreateRequest, tableSchema *TableSchema) *CreateBuilder {
	return &CreateBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

func (builder *CreateBuilder) Validate() error {
	return nil
}

func (builder *CreateBuilder) BuildCreateTableFields() string {
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

func (builder *CreateBuilder) BuildCreate() string {
	return `CREATE TABLE IF NOT EXISTS ` + builder.TableSchema.TableName + ` (
	` + builder.BuildCreateTableFields() + `
	);`
}

func (builder *CreateBuilder) BuildIndex() string {
	schema := builder.TableSchema

	var indexStr strings.Builder
	for _, field := range schema.FieldNames {
		indexStr.WriteString(`CREATE INDEX IF NOT EXISTS ` + schema.TableName + `_` + field + `_idx ON ` + schema.TableName + `("` + field + `");`)
	}
	return indexStr.String()
}

func (builder *CreateBuilder) BuildIndentityFullModifier() string {
	return "ALTER TABLE " + builder.TableSchema.TableName + " REPLICA IDENTITY FULL;"
}

func (builder *CreateBuilder) ToSQLQueries() (string, string, error) {
	err := builder.Validate()
	if err != nil {
		return "", "", err
	}
	return builder.BuildCreate(), builder.BuildIndex(), nil
}
