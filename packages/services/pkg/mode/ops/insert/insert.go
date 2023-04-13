package insert

import (
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

// InsertBuilder is a builder for inserting records into a table.
type InsertBuilder struct {
	Request     *pb_mode.InsertRequest
	TableSchema *mode.TableSchema
}

// NewInsertBuilder returns a new instance of an InsertBuilder using the specified InsertRequest and TableSchema
// instances.
//
// Parameters:
//   - request (*pb_mode.InsertRequest): A protocol buffer representation of an insert request.
//   - tableSchema (*mode.TableSchema): A mode.TableSchema instance containing metadata about the table to insert the
//     data into.
//
// Returns:
// - (*InsertBuilder): A new instance of an InsertBuilder using the specified InsertRequest and TableSchema instances.
func NewInsertBuilder(request *pb_mode.InsertRequest, tableSchema *mode.TableSchema) *InsertBuilder {
	return &InsertBuilder{
		Request:     request,
		TableSchema: tableSchema,
	}
}

// Validate validates the request specified in the InsertBuilder instance. It returns an error
// if the request is invalid, and nil otherwise.
//
// Returns:
// - (error): An error, if the request is invalid, and nil otherwise.
func (builder *InsertBuilder) Validate() error {
	return nil
}

// BuildInsertRowFromKV builds a string representation of a row of an INSERT statement using the specified row
// and fieldNames. It returns the string representation of the row.
//
// Parameters:
// - row (map[string]string): A map containing the row data to be included in the INSERT statement.
// - fieldNames ([]string): A list of column names to be included in the INSERT statement.
//
// Returns:
// - (string): A string representation of a row of an INSERT statement using the specified row and fieldNames.
func (builder *InsertBuilder) BuildInsertRowFromKV(row map[string]string, fieldNames []string) string {
	rowStr := ""
	for idx, field := range fieldNames {

		// Handle array fields.
		if strings.Contains(builder.TableSchema.PostgresTypes[field], "[]") {
			rowStr = rowStr + `ARRAY['` + row[field] + `']`
		} else {
			rowStr = rowStr + `'` + row[field] + `'`
		}
		if idx != len(fieldNames)-1 {
			rowStr = rowStr + `, `
		}
	}
	return rowStr
}

// BuildInsert builds an INSERT statement using the Request and TableSchema properties of the InsertBuilder instance.
// It returns the string representation of the INSERT statement.
//
// Returns:
//   - (string): A string representation of an INSERT statement using the Request and TableSchema properties of the
//     InsertBuilder instance.
func (builder *InsertBuilder) BuildInsert() string {
	request := builder.Request

	// Table columns are the key columns and the field columns.
	tableCols := append(builder.TableSchema.KeyNames, builder.TableSchema.FieldNames...)

	var query strings.Builder
	query.WriteString("INSERT INTO " + request.Into + " VALUES (" + builder.BuildInsertRowFromKV(request.Row, tableCols) + ")")
	return query.String()
}

// ToSQLQuery builds a SQL query string for the INSERT statement using the BuildInsert method. It returns the string
// representation of the SQL query.
//
// Returns:
// - (string): A string representation of the SQL query for the INSERT statement using the BuildInsert method.
func (builder *InsertBuilder) ToSQLQuery() string {
	return builder.BuildInsert()
}
