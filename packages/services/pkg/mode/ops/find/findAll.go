package find

import (
	"strings"
)

// FindAllBuilder is a builder for selecting records from multiple tables.
type FindAllBuilder struct {
	QueryNamespace string
	WorldNamespace string

	TablesInNamespace []string
	TablesFilter      []string
}

// NewFindAllBuilder creates a new instance of FindAllBuilder with the specified queryNamespace,
// worldNamespace, tablesInNamespace, and tablesFilter. It returns a pointer to the newly created
// FindAllBuilder instance, and an error, if there is one.
//
// Parameters:
//   - queryNamespace (string): The namespace in which the tables are queried.
//   - worldNamespace (string): The namespace of the world in which the tables are queries.
//   - tablesInNamespace ([]string): A list of table names in the namespace.
//   - tablesFilter ([]string): A list of table names to include in the SELECT statement. If this is empty,
//     all tables in the namespace will be included.
//
// Returns:
// - (*FindAllBuilder, error): A pointer to the newly created FindAllBuilder instance, and an error, if there is one.
func NewFindAllBuilder(queryNamespace, worldNamespace string, tablesInNamespace []string, tablesFilter []string) (*FindAllBuilder, error) {
	return &FindAllBuilder{
		QueryNamespace:    queryNamespace,
		WorldNamespace:    worldNamespace,
		TablesInNamespace: tablesInNamespace,
		TablesFilter:      tablesFilter,
	}, nil
}

// TableList returns a list of table names to be used in the SELECT statement. If a list of tables to
// include in the SELECT statement was specified in the FindAllBuilder instance, it returns that list.
// Otherwise, it returns a list of all tables in the namespace.
//
// Returns:
//   - ([]string): A list of table names to be used in the SELECT statement.
func (builder *FindAllBuilder) TableList() (tableList []string) {
	// If the FindAll request has specified tables which to find(),
	// build the "FROM" based on those tables, otherwise build
	// a "FROM" for every table.
	if len(builder.TablesFilter) == 0 {
		tableList = builder.TablesInNamespace
	} else {
		tableList = builder.TablesFilter
	}
	return
}

// Validate validates the request specified in the FindAllBuilder instance. It returns an error
// if the request is invalid, and nil otherwise.
//
// Returns:
// - (error): An error, if the request is invalid, and nil otherwise.
func (builder *FindAllBuilder) Validate() error {
	return nil
}

// ToSQLQueryList validates the FindAllBuilder instance and constructs the full SQL SELECT statement for
// each table in the table list. It returns a list of string representations of the full SQL SELECT statements,
// a list of table names, and an error, if there is one.
//
// Returns:
//   - ([]string, []string, error): A list of string representations of the full SQL SELECT statements,
//     a list of table names, and an error, if there is one.
func (builder *FindAllBuilder) ToSQLQueryList() (queries []string, tableNameList []string, err error) {
	err = builder.Validate()
	if err != nil {
		return
	}

	for _, tableName := range builder.TableList() {
		var query strings.Builder
		query.WriteString("SELECT * FROM " + builder.QueryNamespace + ".\"" + tableName + "\"")
		// Handle the internal schema table specially. The schemas are stored all in one
		// table even though for different namespaces (i.e. different worlds), so we need
		// to filter by namespace.
		if tableName == "schemas" {
			query.WriteString(" WHERE namespace = '" + builder.WorldNamespace + "'")
		}
		queries = append(queries, query.String())
		tableNameList = append(tableNameList, tableName)
	}
	return
}

// GetFieldProjections returns an empty map, as the FindAllBuilder SELECT statements do not have any field projections.
//
// Returns:
// - (map[string]string): An empty map, as the FindAllBuilder instance does not have any field projections.
func (builder *FindAllBuilder) GetFieldProjections() map[string]string {
	return make(map[string]string)
}
