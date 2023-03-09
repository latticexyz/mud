package mode

import (
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

type InsertBuilder struct {
	Request     *mode.InsertRequest
	TableSchema *TableSchema
}

func NewInsertBuilder(request *mode.InsertRequest, tableSchema *TableSchema) *InsertBuilder {
	return &InsertBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

func (builder *InsertBuilder) Validate() error {
	return nil
}

func (builder *InsertBuilder) BuildInsertRowFromKV(row map[string]string, fieldNames []string) string {
	rowStr := ""
	for idx, field := range fieldNames {
		rowStr = rowStr + `'` + row[field] + `'`
		if idx != len(row)-1 {
			rowStr = rowStr + `, `
		}
	}
	return rowStr
}

func (builder *InsertBuilder) BuildInsert() string {
	request := builder.Request

	var query strings.Builder
	query.WriteString("INSERT INTO " + request.Into + " VALUES (" + builder.BuildInsertRowFromKV(request.Row, builder.TableSchema.FieldNames) + ")")
	return query.String()
}

func (builder *InsertBuilder) ToSQLQuery() string {
	return builder.BuildInsert()
}
