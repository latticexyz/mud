package insert

import (
	"latticexyz/mud/packages/services/pkg/mode"
)

type Request struct {
	Into string
	Row  map[string]interface{}
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

func (builder *Builder) BuildRecord() (interface{}, error) {
	// Build a record from the row.
	record, err := builder.table.BuildRecord(builder.request.Row)
	if err != nil {
		return nil, err
	}
	return record, nil
}

func (builder *Builder) Into() string {
	return builder.request.Into
}
