package create

import (
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

// CreateBuilder is a builder for creating a table.
type Builder struct {
	Request *pb_mode.CreateRequest
	Table   *mode.Table
}

// NewCreateBuilder creates a new instance of CreateBuilder with the specified CreateRequest and
// TableSchema. It returns a pointer to the newly created CreateBuilder instance.
//
// Parameters:
//   - request (*pb_mode.CreateRequest): A pointer to the CreateRequest instance that contains the
//     parameters for the CREATE TABLE statement.
//   - tableSchema (*mode.TableSchema): A pointer to the TableSchema instance that contains the schema
//     information for the table to be created.
//
// Returns:
// - (*CreateBuilder): A pointer to the newly created CreateBuilder instance.
func NewBuilder(request *pb_mode.CreateRequest, table *mode.Table) *Builder {
	return &Builder{
		Request: request,
		Table:   table,
	}
}

// Validate validates the request specified in the CreateBuilder instance. It returns an error
// if the request is invalid, and nil otherwise.
//
// Returns:
// - (error): An error, if the request is invalid, and nil otherwise.
func (builder *Builder) Validate() error {
	return nil
}

// BuildCreateTableKeyFields constructs the string representation of key fields to be used
// in the CREATE TABLE statement. If there are no key names specified in the table schema,
// it returns an empty string.
//
// Returns:
// - (string): A string representation of key fields to be used in the CREATE TABLE statement.
func (builder *Builder) BuildCreateTableKeyFields() string {
	table := builder.Table

	if len(table.KeyNames) == 0 {
		return ""
	}
	keyFields := ""
	for idx, field := range table.KeyNames {
		postgresType := table.GetPostgresType(field)
		keyFields = keyFields + field + ` ` + postgresType
		if idx != len(table.KeyNames)-1 {
			keyFields += `, `
		}
	}
	return keyFields
}

// BuildCreateTableValueFields constructs the string representation of value fields to be used
// in the CREATE TABLE statement. If there are no field names specified in the table schema,
// it returns an empty string.
//
// Returns:
// - (string): A string representation of value fields to be used in the CREATE TABLE statement.
func (builder *Builder) BuildCreateTableValueFields() string {
	table := builder.Table

	if len(table.FieldNames) == 0 {
		return ""
	}
	valueFields := ""
	for idx, field := range table.FieldNames {
		postgresType := table.GetPostgresType(field)
		valueFields = valueFields + field + ` ` + postgresType
		if idx != len(table.FieldNames)-1 {
			valueFields += `, `
		}
	}
	return valueFields
}

// BuildCreateTableFields constructs the string representation of all fields to be used
// in the CREATE TABLE statement. It concatenates the string representation of key fields
// and value fields. If either of them is an empty string, it is not included in the result.
//
// Returns:
// - (string): A string representation of all fields to be used in the CREATE TABLE statement.
func (builder *Builder) BuildCreateTableFields() string {
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

// BuildCreate constructs the CREATE TABLE statement for the table schema specified in the
// CreateBuilder instance. It returns a string representation of the CREATE TABLE statement.
//
// Returns:
// - (string): A string representation of the CREATE TABLE statement.
func (builder *Builder) BuildCreate() string {
	return `CREATE TABLE IF NOT EXISTS ` + builder.Table.NamespacedName() + ` (
	` + builder.BuildCreateTableFields() + `
	);`
}

// BuildIndex constructs the CREATE INDEX statements for all fields in the table schema specified
// in the CreateBuilder instance. It returns a string representation of the CREATE INDEX statements.
//
// Returns:
// - (string): A string representation of the CREATE INDEX statements.
func (builder *Builder) BuildIndex() string {
	var indexStr strings.Builder
	for _, field := range builder.Table.FieldNames {
		indexStr.WriteString(
			`CREATE INDEX IF NOT EXISTS ` + builder.Table.Name + `_` + field +
				`_idx ON ` + builder.Table.NamespacedName() +
				`("` + field + `");`,
		)
	}
	return indexStr.String()
}

// BuildIdentityFullModifier constructs the ALTER TABLE statement with REPLICA IDENTITY FULL for the
// table schema specified in the CreateBuilder instance. This is used to set the replica identity
// to full for the table.
//
// Returns:
// - (string): A string representation of the ALTER TABLE statement to modify for full identity.
func (builder *Builder) BuildIndentityFullModifier() string {
	return "ALTER TABLE " + builder.Table.NamespacedName() + " REPLICA IDENTITY FULL;"
}

// ToSQLQueries validates the table schema and constructs the CREATE TABLE and CREATE INDEX statements
// for the table schema specified in the CreateBuilder instance. It returns a tuple of two strings:
// the CREATE TABLE statement and the CREATE INDEX statement, respectively. If there is an error during
// validation or construction, it returns an error.
//
// Returns:
//   - (string, string, error): A tuple of two strings: the CREATE TABLE statement and the CREATE INDEX statement,
//     respectively, and an error, if there is one.
func (builder *Builder) ToSQLQueries() (string, string, error) {
	err := builder.Validate()
	if err != nil {
		return "", "", err
	}
	return builder.BuildCreate(), builder.BuildIndex(), nil
}
