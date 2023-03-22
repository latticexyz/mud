package stream

type StreamAllBuilder struct {
	ChainTables []string
	WorldTables []string

	TablesSet map[string]bool
}

func NewStreamAllBuilder(chainTables []string, worldTables []string) *StreamAllBuilder {
	// Build a set of all tables that the client is interested in (if any).
	tableSet := make(map[string]bool)
	for _, tableName := range chainTables {
		tableSet[tableName] = true
	}
	for _, tableName := range worldTables {
		tableSet[tableName] = true
	}

	return &StreamAllBuilder{
		ChainTables: chainTables,
		WorldTables: worldTables,
		TablesSet:   tableSet,
	}
}

func (builder *StreamAllBuilder) ShouldStream(tableName string) bool {
	if len(builder.TablesSet) == 0 {
		return true
	} else {
		return builder.TablesSet[tableName]
	}
}
