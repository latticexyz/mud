package mode

import (
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

// grpcurl -plaintext -d '{"tables": ["component_stake"]}' localhost:50091 mode.QueryLayer/FindAll

type FindAllBuilder struct {
	Request   *mode.FindAllRequest
	AllTables []string
}

func NewFindAllBuilder(request *mode.FindAllRequest, allTables []string) *FindAllBuilder {
	return &FindAllBuilder{
		Request:   request,
		AllTables: allTables,
	}
}

func (builder *FindAllBuilder) Validate() error {
	return nil
}

func (builder *FindAllBuilder) BuildProjection() string {
	return "SELECT *"
}

func (builder *FindAllBuilder) BuildFrom() string {
	request := builder.Request

	var query strings.Builder

	// If the FindAll request has specified tables which to find(),
	// build the "FROM" based on those tables, otherwise build
	// a "FROM" for every table.
	var tableList []string

	if len(request.Tables) == 0 {
		tableList = builder.AllTables
	} else {
		tableList = request.Tables
	}

	for idx, tableName := range tableList {
		// For initial table the clause is FROM.
		if idx == 0 {
			query.WriteString(" FROM ")
		} else {
			query.WriteString(" NATURAL FULL JOIN ")
		}
		// Write the SELECT per-table.
		query.WriteString("(SELECT '" + tableName + "' AS source, entityid FROM " + tableName + ") " + tableName + "")
	}
	return query.String()
}

// TODO: if favorable comments about query structure, then can refactor this to return an
// intermediary representation of MODE "stage" to reuse code for JOINs, etc.
func (builder *FindAllBuilder) ToQuery() (string, error) {
	err := builder.Validate()
	if err != nil {
		return "", err
	}

	var query strings.Builder

	query.WriteString(builder.BuildProjection())
	query.WriteString(builder.BuildFrom())

	return query.String(), nil
}
