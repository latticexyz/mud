package find

import (
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
	"strings"
)

// FindBuilder is a builder for selecting records from a table.
type FindBuilder struct {
	TableName       string
	Filter          []*pb_mode.Filter
	Project         []*pb_mode.ProjectedField
	Namespace       *pb_mode.Namespace
	NamespaceString string
}

// New__FromFindRequest creates a new instance of FindBuilder with the specified FindRequest and namespace.
// It returns a pointer to the newly created FindBuilder instance.
//
// Parameters:
//   - request (*pb_mode.FindRequest): A pointer to the FindRequest instance that contains the parameters
//     for the SELECT statement.
//   - namespace (string): The namespace in which the table resides.
//
// Returns:
// - (*FindBuilder): A pointer to the newly created FindBuilder instance.
func New__FromFindRequest(request *pb_mode.FindRequest, namespace string) *FindBuilder {
	return &FindBuilder{
		TableName:       request.From,
		Filter:          request.Filter,
		Project:         request.Project,
		Namespace:       request.Namespace,
		NamespaceString: namespace,
	}
}

// New__FromSingle__StateRequest creates a new instance of FindBuilder with the specified Single__StateRequest
// and namespace. It returns a pointer to the newly created FindBuilder instance.
//
// Parameters:
//   - request (*pb_mode.Single__StateRequest): A pointer to the Single__StateRequest instance that contains the
//     parameters for the SELECT statement.
//   - namespace (string): The namespace in which the table resides.
//
// Returns:
// - (*FindBuilder): A pointer to the newly created FindBuilder instance.
func New__FromSingle__StateRequest(request *pb_mode.Single__StateRequest, namespace string) *FindBuilder {
	return &FindBuilder{
		TableName:       request.Table,
		Filter:          request.Filter,
		Project:         request.Project,
		Namespace:       request.Namespace,
		NamespaceString: namespace,
	}
}

// Validate validates the request specified in the FindBuilder instance. It returns an error
// if the request is invalid, and nil otherwise.
//
// Returns:
// - (error): An error, if the request is invalid, and nil otherwise.
func (builder *FindBuilder) Validate() error {
	return nil
}

// BuildFilter constructs the WHERE clause for the SELECT statement using the specified filter conditions
// in the FindBuilder instance. It returns a string representation of the WHERE clause.
//
// Returns:
// - (string): A string representation of the WHERE clause.
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

// BuildFrom constructs the FROM clause for the SELECT statement using the specified table and namespace
// in the FindBuilder instance. It returns a string representation of the FROM clause.
//
// Returns:
// - (string): A string representation of the FROM clause.
func (builder *FindBuilder) BuildFrom() string {
	var query strings.Builder
	query.WriteString(" FROM " + builder.NamespaceString + "." + builder.TableName)
	return query.String()
}

// BuildProjection constructs the SELECT clause for the SELECT statement using the specified projections
// in the FindBuilder instance. It returns a string representation of the SELECT clause.
//
// Returns:
// - (string): A string representation of the SELECT clause.
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

// ToSQLQuery validates the FindBuilder instance and constructs the full SQL SELECT statement using the
// specified projections, table, and filter conditions. It returns a string representation of the full SQL
// SELECT statement and an error, if there is one.
//
// Returns:
// - (string, error): A string representation of the full SQL SELECT statement and an error, if there is one.
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

// GetFieldProjections returns a map of the field projections for the FindBuilder instance. It maps the
// field name aliases to their corresponding table fields.
//
// Returns:
// - (map[string]string): A map of the field projections for the FindBuilder instance.
func (builder *FindBuilder) GetFieldProjections() map[string]string {
	fieldProjections := make(map[string]string)
	for _, projection := range builder.Project {
		if projection.Rename != nil {
			fieldProjections[*projection.Rename] = projection.Field.TableField
		}
	}
	return fieldProjections
}
