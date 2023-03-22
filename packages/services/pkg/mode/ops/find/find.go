package find

import (
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

type FindBuilder struct {
	TableName       string
	Filter          []*pb_mode.Filter
	Project         []*pb_mode.ProjectedField
	Namespace       *pb_mode.Namespace
	NamespaceString string
}

func New__FromFindRequest(request *pb_mode.FindRequest, namespace string) *FindBuilder {
	return &FindBuilder{
		TableName:       request.From,
		Filter:          request.Filter,
		Project:         request.Project,
		Namespace:       request.Namespace,
		NamespaceString: namespace,
	}
}

func New__FromSingle__StateRequest(request *pb_mode.Single__StateRequest, namespace string) *FindBuilder {
	return &FindBuilder{
		TableName:       request.Table,
		Filter:          request.Filter,
		Project:         request.Project,
		Namespace:       request.Namespace,
		NamespaceString: namespace,
	}
}

func (builder *FindBuilder) Validate() error {
	return nil
}

/*
grpcurl -plaintext -d '{"from": "component_position", "filter": [{"field": {"table_name": "test", "table_field": "x"}, "operator": ">", "value": "0" }, {"field": {"table_name": "test", "table_field": "y"}, "operator": ">", "value": "0" }],  "project": [{"field": {"table_name": "test", "table_field": "x"}}, {"field": {"table_name": "test", "table_field": "y"}}] }' localhost:50091 mode.QueryLayer/Find
grpcurl -plaintext -d '{"from": "component_stake", "filter": [],  "project": [{field: {table_name: 'component_stake', field_name: 'value'}, rename: 'stake'}] }' localhost:50091 mode.QueryLayer/Find
*/

func (builder *FindBuilder) BuildFilter() string {
	if len(builder.Filter) == 0 {
		return ""
	}

	var query strings.Builder
	query.WriteString(" WHERE ")
	for idx, filter := range builder.Filter {
		if filter.Function != "" {
			query.WriteString(filter.Function)
			query.WriteString("(")
		}
		query.WriteString(filter.Field.TableName + "." + filter.Field.TableField)
		if filter.Function != "" {
			query.WriteString(")")
		}
		query.WriteString(" ")
		query.WriteString(filter.Operator)
		query.WriteString(" ")
		if filter.Function != "" {
			query.WriteString(filter.Function)
			query.WriteString("(")
		}
		query.WriteString("'")
		query.WriteString(filter.Value)
		query.WriteString("'")
		if filter.Function != "" {
			query.WriteString(")")
		}

		if idx < len(builder.Filter)-1 {
			query.WriteString(" AND ")
		}
	}

	return query.String()
}

func (builder *FindBuilder) BuildFrom() string {
	var query strings.Builder
	query.WriteString(" FROM " + builder.NamespaceString + "." + builder.TableName)
	return query.String()
}

func (builder *FindBuilder) BuildProjection() string {
	var query strings.Builder
	query.WriteString("SELECT ")

	if len(builder.Project) == 0 {
		query.WriteString("*")
		return query.String()
	}

	for idx, projection := range builder.Project {
		query.WriteString(projection.Field.TableName + "." + projection.Field.TableField)
		if projection.Rename != nil {
			query.WriteString(" AS " + *projection.Rename)
		}
		if idx < len(builder.Project)-1 {
			query.WriteString(", ")
		}
	}
	return query.String()
}

// TODO: if favorable comments about query structure, then can refactor this to return an
// intermediary representation of MODE "stage" to reuse code for JOINs, etc.
func (builder *FindBuilder) ToSQLQuery() (string, error) {
	err := builder.Validate()
	if err != nil {
		return "", err
	}

	var query strings.Builder

	query.WriteString(builder.BuildProjection())
	query.WriteString(builder.BuildFrom())
	query.WriteString(builder.BuildFilter())

	return query.String(), nil
}

func (builder *FindBuilder) GetFieldProjections() map[string]string {

	fieldProjections := make(map[string]string)

	for _, projection := range builder.Project {
		if projection.Rename != nil {
			fieldProjections[*projection.Rename] = projection.Field.TableField
		}
	}

	return fieldProjections
}
