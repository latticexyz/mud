package stream

import (
	"latticexyz/mud/packages/services/pkg/mode"
	"latticexyz/mud/packages/services/pkg/mode/schema"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"
)

type StreamAllBuilder struct {
	// Namespaces.
	QueryNamespace *pb_mode.Namespace
	ChainNamespace *pb_mode.Namespace
	WorldNamespace *pb_mode.Namespace

	ChainTables []string
	WorldTables []string

	TablesSet map[string]bool
}

func NewStreamAllBuilder(queryNamespace *pb_mode.Namespace, chainTables []string, worldTables []string) *StreamAllBuilder {
	// Build a set of all tables that the client is interested in (if any).
	tableSet := make(map[string]bool)
	for _, tableName := range chainTables {
		tableSet[tableName] = true
	}
	for _, tableName := range worldTables {
		tableSet[tableName] = true
	}

	// Get sub-namespaces for the request. A namespace is a chainId and worldAddress pair.
	chainNamespace, worldNamespace := schema.NamespaceToSubNamespaces(queryNamespace)

	return &StreamAllBuilder{
		QueryNamespace: queryNamespace,
		ChainNamespace: chainNamespace,
		WorldNamespace: worldNamespace,
		ChainTables:    chainTables,
		WorldTables:    worldTables,
		TablesSet:      tableSet,
	}
}

func (builder *StreamAllBuilder) ShouldStream(tableSchema *mode.TableSchema) bool {
	return builder.doesPassTableFilter(tableSchema.TableName) && builder.doesPassNamespaceFilter(tableSchema.Namespace)
}

func (builder *StreamAllBuilder) doesPassTableFilter(tableName string) bool {
	if len(builder.TablesSet) == 0 {
		return true
	} else {
		return builder.TablesSet[tableName]
	}
}

func (builder *StreamAllBuilder) doesPassNamespaceFilter(namespaceString string) bool {
	println("doesPassNamespaceFilter: ", namespaceString)

	// Convert a namespace string to a namespace object.
	incomingEventTableNamespace, err := schema.NamespaceObjectFromNamespace(namespaceString)
	if err != nil {
		return false
	}
	if incomingEventTableNamespace.WorldAddress != "" {
		// If the incoming event is for a world table, then it must match the world address in the query.
		return schema.IsNamespaceEqual(builder.WorldNamespace, incomingEventTableNamespace)
	}
	// If the incoming event is for a chain table, then it must match the chainId in the query.
	return schema.IsNamespaceEqual(builder.ChainNamespace, incomingEventTableNamespace)
}
