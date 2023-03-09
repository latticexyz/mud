package mode

import (
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

type DeleteBuilder struct {
	Request     *mode.DeleteRequest
	TableSchema *TableSchema
}

func NewDeleteBuilder(request *mode.DeleteRequest, tableSchema *TableSchema) *DeleteBuilder {
	return &DeleteBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

func (builder *DeleteBuilder) Validate() error {
	return nil
}

func (builder *DeleteBuilder) BuildDelete() string {
	request := builder.Request

	var query strings.Builder
	query.WriteString("DELETE FROM " + request.From)
	return query.String()
}

func (builder *DeleteBuilder) BuildFilter() string {
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

func (builder *DeleteBuilder) ToSQLQuery() string {
	return builder.BuildDelete() + builder.BuildFilter()
}
