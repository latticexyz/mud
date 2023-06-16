package delete

import "latticexyz/mud/packages/services/pkg/mode"

type Request struct {
	Table  string
	Filter map[string]interface{}
}

type Builder struct {
	request *Request
	table   *mode.Table
}

func NewBuilder(request *Request, table *mode.Table) *Builder {
	return &Builder{
		request: request,
		table:   table,
	}
}

func (builder *Builder) Table() string {
	return builder.request.Table
}
