package find

import (
	"strings"
)

// grpcurl -plaintext -d '{"tables": ["component_stake"]}' localhost:50091 mode.QueryLayer/FindAll

type FindAllBuilder struct {
	QueryNamespace string
	WorldNamespace string

	TablesInNamespace []string
	TablesFilter      []string
}

func NewFindAllBuilder(queryNamespace, worldNamespace string, tablesInNamespace []string, tablesFilter []string) (*FindAllBuilder, error) {
	return &FindAllBuilder{
		QueryNamespace:    queryNamespace,
		WorldNamespace:    worldNamespace,
		TablesInNamespace: tablesInNamespace,
		TablesFilter:      tablesFilter,
	}, nil
}

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

func (builder *FindAllBuilder) Validate() error {
	return nil
}

func (builder *FindAllBuilder) ToSQLQueryList() (queries []string, tableNameList []string, err error) {
	err = builder.Validate()
	if err != nil {
		return
	}

	for _, tableName := range builder.TableList() {
		var query strings.Builder
		query.WriteString("SELECT * FROM " + builder.QueryNamespace + "." + tableName)
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

func (builder *FindAllBuilder) GetFieldProjections() map[string]string {
	return make(map[string]string)
}
