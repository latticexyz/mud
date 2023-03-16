package join

import (
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

type JoinBuilder struct {
	Request *mode.JoinRequest
}

func NewJoinBuilder(request *mode.JoinRequest) *JoinBuilder {
	return &JoinBuilder{
		Request: request,
	}
}

func (builder *JoinBuilder) Validate() error {
	return nil
}

/*
grpcurl -plaintext -d '{"on": {"field1": {"table_name": "test1", "table_field": "x"}, "field2": {"table_name": "test2", "table_field": "x"}}, "children": [{"from": "test1", "filter": [{"field": {"table_name": "test1", "table_field": "x"}, "operator": ">", "value": "0" }],  "project": [] }, {"from": "test2", "filter": [],  "project": [] }]}' localhost:50091 mode.QueryLayer/Join
grpcurl -plaintext -d '{"on": {"field1": {"table_name": "component_item", "table_field": "entityid"}, "field2": {"table_name": "component_position", "table_field": "entityid"}}, "children": [{"from": "component_item", "filter": [],  "project": [] }, {"from": "component_position", "filter": [{"field": {"table_name": "component_position", "table_field": "x"}, "operator": ">", "value": "0" }],  "project": [] }]}' localhost:50091 mode.QueryLayer/Join


grpcurl -plaintext -d '{"on": {"field1": {"table_name": "component_item", "table_field": "entityid"}, "field2": {"table_name": "component_position", "table_field": "entityid"}}, "children": [{"from": "component_item", "filter": [],  "project": [{"field": {"table_name": "component_position", "table_field": "entityid"}, "rename": "position_entityid"}] }, {"from": "component_position", "filter": [{"field": {"table_name": "component_position", "table_field": "x"}, "operator": ">", "value": "0" }],  "project": [] }]}' localhost:50091 mode.QueryLayer/Join
*/

func (builder *JoinBuilder) BuildFilter() string {
	if len(builder.Request.Children) != 2 {
		logger.GetLogger().Fatal("Currently JOIN only support two tables")
	}

	findRequest1 := builder.Request.Children[0]
	findRequest2 := builder.Request.Children[1]

	if len(findRequest1.Filter) == 0 && len(findRequest2.Filter) == 0 {
		return ""
	}

	var query strings.Builder
	query.WriteString(" WHERE ")
	for idx, filter := range findRequest1.Filter {
		query.WriteString(filter.Field.TableName + "." + filter.Field.TableField)
		query.WriteString(" ")
		query.WriteString(filter.Operator)
		query.WriteString(" ")
		query.WriteString(filter.Value)

		if idx < len(findRequest1.Filter)-1 {
			query.WriteString(" AND ")
		}
	}

	for idx, filter := range findRequest2.Filter {
		query.WriteString(filter.Field.TableName + "." + filter.Field.TableField)
		query.WriteString(" ")
		query.WriteString(filter.Operator)
		query.WriteString(" ")
		query.WriteString(filter.Value)

		if idx < len(findRequest2.Filter)-1 {
			query.WriteString(" AND ")
		}
	}

	return query.String()
}

func (builder *JoinBuilder) BuildFrom() string {
	if len(builder.Request.Children) != 2 {
		logger.GetLogger().Fatal("Currently JOIN only support two tables")
	}

	var query strings.Builder
	query.WriteString(" FROM " + builder.Request.Children[0].From)
	return query.String()
}

func (builder *JoinBuilder) BuildOn() string {
	if len(builder.Request.Children) != 2 {
		logger.GetLogger().Fatal("Currently JOIN only support two tables")
	}

	var query strings.Builder
	query.WriteString(" INNER JOIN " + builder.Request.Children[1].From)
	query.WriteString(" ON " + builder.Request.On.Field1.TableName + "." + builder.Request.On.Field1.TableField)
	query.WriteString(" = ")
	query.WriteString(builder.Request.On.Field2.TableName + "." + builder.Request.On.Field2.TableField)

	return query.String()
}

func (builder *JoinBuilder) BuildProjection() string {
	if len(builder.Request.Children) != 2 {
		logger.GetLogger().Fatal("Currently JOIN only support two tables")
	}

	var query strings.Builder
	query.WriteString("SELECT ")

	findRequest1 := builder.Request.Children[0]
	findRequest2 := builder.Request.Children[1]

	if len(findRequest1.Project) == 0 && len(findRequest2.Project) == 0 {
		query.WriteString("*")
		return query.String()
	}

	for idx, projection := range findRequest1.Project {
		query.WriteString(projection.Field.TableName + "." + projection.Field.TableField)
		if projection.Rename != nil {
			query.WriteString(" AS " + *projection.Rename)
		}
		if idx < len(findRequest1.Project)-1 {
			query.WriteString(", ")
		}
	}

	for idx, projection := range findRequest2.Project {
		query.WriteString(projection.Field.TableName + "." + projection.Field.TableField)
		if projection.Rename != nil {
			query.WriteString(" AS " + *projection.Rename)
		}
		if idx < len(findRequest2.Project)-1 {
			query.WriteString(", ")
		}
	}

	return query.String()
}

func (builder *JoinBuilder) ToSQLQuery() (string, error) {
	err := builder.Validate()
	if err != nil {
		return "", err
	}

	var query strings.Builder

	query.WriteString(builder.BuildProjection())
	query.WriteString(builder.BuildFrom())
	query.WriteString(builder.BuildOn())
	query.WriteString(builder.BuildFilter())

	return query.String(), nil
}

func (builder *JoinBuilder) GetTableList() []string {
	if len(builder.Request.Children) != 2 {
		logger.GetLogger().Fatal("Currently JOIN only support two tables")
	}

	var tables []string
	tables = append(tables, builder.Request.Children[0].From)
	tables = append(tables, builder.Request.Children[1].From)

	return tables
}

func (builder *JoinBuilder) GetFieldProjections() map[string]string {
	if len(builder.Request.Children) != 2 {
		logger.GetLogger().Fatal("Currently JOIN only support two tables")
	}

	fieldProjections := make(map[string]string)

	for _, projection := range builder.Request.Children[0].Project {
		if projection.Rename != nil {
			fieldProjections[*projection.Rename] = projection.Field.TableField
		}
	}

	for _, projection := range builder.Request.Children[1].Project {
		if projection.Rename != nil {
			fieldProjections[*projection.Rename] = projection.Field.TableField
		}
	}

	return fieldProjections
}
