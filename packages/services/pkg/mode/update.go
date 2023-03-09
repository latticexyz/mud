package mode

import (
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

type UpdateBuilder struct {
	Request     *mode.UpdateRequest
	TableSchema *TableSchema
}

func NewUpdateBuilder(request *mode.UpdateRequest, tableSchema *TableSchema) *UpdateBuilder {
	return &UpdateBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

func (builder *UpdateBuilder) Validate() error {
	return nil
}

func (builder *UpdateBuilder) BuildUpdateRowFromKV(row map[string]string, fieldNames []string) string {
	rowStr := ""
	for idx, field := range fieldNames {
		rowStr = rowStr + field + ` = ` + `'` + row[field] + `'`
		if idx != len(row)-1 {
			rowStr = rowStr + `, `
		}
	}
	return rowStr
}

func (builder *UpdateBuilder) BuildUpdate() string {
	request := builder.Request

	var query strings.Builder
	query.WriteString("UPDATE " + request.Target + " SET " + builder.BuildUpdateRowFromKV(request.Row, builder.TableSchema.FieldNames))
	return query.String()
}

func (builder *UpdateBuilder) BuildFilter() string {
	request := builder.Request

	if len(request.Filter) == 0 {
		return ""
	}

	var query strings.Builder
	query.WriteString(" WHERE ")
	for idx, filter := range request.Filter {
		query.WriteString(filter.Field.TableName + "." + filter.Field.TableField)
		query.WriteString(" ")
		query.WriteString(filter.Operator)
		query.WriteString(" '")
		query.WriteString(filter.Value)
		query.WriteString("' ")

		if idx < len(request.Filter)-1 {
			query.WriteString(" AND ")
		}
	}

	return query.String()
}

func (builder *UpdateBuilder) ToSQLQuery() string {
	var query strings.Builder
	query.WriteString(builder.BuildUpdate())
	query.WriteString(builder.BuildFilter())
	return query.String()
}
