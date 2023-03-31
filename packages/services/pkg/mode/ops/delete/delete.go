package delete

import (
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

// DeleteBuilder is a builder for deleting records from a table.
type DeleteBuilder struct {
	Request     *pb_mode.DeleteRequest
	TableSchema *mode.TableSchema
}

// NewDeleteBuilder creates a new instance of DeleteBuilder with the specified DeleteRequest and
// TableSchema. It returns a pointer to the newly created DeleteBuilder instance.
//
// Parameters:
//   - request (*pb_mode.DeleteRequest): A pointer to the DeleteRequest instance that contains the
//     parameters for the DELETE statement.
//   - tableSchema (*mode.TableSchema): A pointer to the TableSchema instance that contains the schema
//     information for the table from which rows are to be deleted.
//
// Returns:
// - (*DeleteBuilder): A pointer to the newly created DeleteBuilder instance.
func NewDeleteBuilder(request *pb_mode.DeleteRequest, tableSchema *mode.TableSchema) *DeleteBuilder {
	return &DeleteBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

// Validate validates the request specified in the DeleteBuilder instance. It returns an error
// if the request is invalid, and nil otherwise.
//
// Returns:
// - (error): An error, if the request is invalid, and nil otherwise.
func (builder *DeleteBuilder) Validate() error {
	return nil
}

// BuildDelete constructs the DELETE statement for the specified table in the DeleteBuilder request.
// It returns a string representation of the DELETE statement.
//
// Returns:
// - (string): A string representation of the DELETE statement.
func (builder *DeleteBuilder) BuildDelete() string {
	request := builder.Request

	var query strings.Builder
	query.WriteString("DELETE FROM " + request.From)
	return query.String()
}

// BuildFilter constructs the WHERE clause for the DELETE statement using the specified filter conditions
// in the DeleteBuilder request. It returns a string representation of the WHERE clause.
//
// Returns:
// - (string): A string representation of the WHERE clause.
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

// ToSQLQuery constructs the full SQL DELETE statement using the specified table and filter conditions
// in the DeleteBuilder request. It returns a string representation of the full SQL DELETE statement.
//
// Returns:
// - (string): A string representation of the full SQL DELETE statement.
func (builder *DeleteBuilder) ToSQLQuery() string {
	return builder.BuildDelete() + builder.BuildFilter()
}
