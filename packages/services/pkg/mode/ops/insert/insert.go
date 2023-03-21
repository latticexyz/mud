package insert

import (
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

type InsertBuilder struct {
	Request     *pb_mode.InsertRequest
	TableSchema *mode.TableSchema
}

func NewInsertBuilder(request *pb_mode.InsertRequest, tableSchema *mode.TableSchema) *InsertBuilder {
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
		if idx != len(fieldNames)-1 {
			rowStr = rowStr + `, `
		}
	}
	return rowStr
}

func (builder *InsertBuilder) BuildInsert() string {
	request := builder.Request

	// Table columns are the key columns and the field columns.
	tableCols := append(builder.TableSchema.KeyNames, builder.TableSchema.FieldNames...)

	var query strings.Builder
	query.WriteString("INSERT INTO " + request.Into + " VALUES (" + builder.BuildInsertRowFromKV(request.Row, tableCols) + ")")
	return query.String()
}

func (builder *InsertBuilder) ToSQLQuery() string {
	return builder.BuildInsert()
}
