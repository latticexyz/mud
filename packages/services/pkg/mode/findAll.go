package mode

import (
	"latticexyz/mud/packages/services/pkg/db"
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"

	"github.com/jmoiron/sqlx"
)

// grpcurl -plaintext -d '{"tables": ["component_stake"]}' localhost:50091 mode.QueryLayer/FindAll

type FindAllBuilder struct {
	Request   *mode.FindAllRequest
	AllTables []string
}

func NewFindAllBuilder(request *mode.FindAllRequest, _db *sqlx.DB) (*FindAllBuilder, error) {
	// An up-to-date list of all tables is used to return the full state, if requested.
	allTables, err := db.GetAllTables(_db)
	if err != nil {
		return nil, err
	}

	return &FindAllBuilder{
		Request:   request,
		AllTables: allTables,
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
		query.WriteString("(SELECT '" + tableName + "' AS source, entityid FROM " + tableName + ") " + tableName + "")
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

func (builder *FindAllBuilder) ToSQLQueryList() (queries []string, tableList []string, err error) {
	err = builder.Validate()
	if err != nil {
		return
	}

	for _, tableName := range builder.TableList() {
		var query strings.Builder
		query.WriteString("SELECT * FROM " + tableName)
		queries = append(queries, query.String())
		tableList = append(tableList, tableName)
	}
	return
}

func (builder *FindAllBuilder) GetFieldProjections() map[string]string {
	return make(map[string]string)
}
