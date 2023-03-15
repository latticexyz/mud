package mode

import (
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

// grpcurl -plaintext -d '{"tables": ["component_stake"]}' localhost:50091 mode.QueryLayer/FindAll

type FindAllBuilder struct {
	Request   *mode.FindAllRequest
	AllTables []string
	Namespace string
}

func NewFindAllBuilder(request *mode.FindAllRequest, namespace string, allTables []string) (*FindAllBuilder, error) {
	return &FindAllBuilder{
		Request:   request,
		AllTables: allTables,
		Namespace: namespace,
	}, nil
}

func (builder *FindAllBuilder) TableList() (tableList []string) {
	// If the FindAll request has specified tables which to find(),
	// build the "FROM" based on those tables, otherwise build
	// a "FROM" for every table.
	if len(builder.Request.Tables) == 0 {
		tableList = builder.AllTables
	} else {
		tableList = builder.Request.Tables
	}
	return
}

func (builder *FindAllBuilder) Validate() error {
	return nil
}

func (builder *FindAllBuilder) BuildProjection() string {
	return "SELECT *"
}

func (builder *FindAllBuilder) BuildFrom() string {
	var query strings.Builder
	for idx, tableName := range builder.TableList() {
		// For initial table the clause is FROM.
		if idx == 0 {
			query.WriteString(" FROM ")
		} else {
			query.WriteString(" NATURAL FULL JOIN ")
		}
		// Write the SELECT per-table.
		fullTableName := builder.Namespace + "." + tableName
		query.WriteString("(SELECT '" + fullTableName + "' AS source, entityid FROM " + fullTableName + ") " + fullTableName + "")
	}
	return query.String()
}

// TODO: if favorable comments about query structure, then can refactor this to return an
// intermediary representation of MODE "stage" to reuse code for JOINs, etc.
func (builder *FindAllBuilder) ToSQLQuery() (string, error) {
	err := builder.Validate()
	if err != nil {
		return "", err
	}

	var query strings.Builder

	query.WriteString(builder.BuildProjection())
	query.WriteString(builder.BuildFrom())

	return query.String(), nil
}

func (builder *FindAllBuilder) ToSQLQueryList() (queries []string, tableNameList []string, err error) {
	err = builder.Validate()
	if err != nil {
		return
	}

	for _, tableName := range builder.TableList() {
		var query strings.Builder
		query.WriteString("SELECT * FROM " + builder.Namespace + "." + tableName)
		queries = append(queries, query.String())
		tableNameList = append(tableNameList, tableName)
	}
	return
}

func (builder *FindAllBuilder) GetFieldProjections() map[string]string {
	return make(map[string]string)
}
