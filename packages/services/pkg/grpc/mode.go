package grpc

import (
	"context"
	"latticexyz/mud/packages/services/pkg/mode"
	pb_mode "latticexyz/mud/packages/services/protobuf/go/mode"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type MODEServer struct {
	pb_mode.UnimplementedQueryLayerServer

	eth *ethclient.Client
	db  *sqlx.DB

	schemaManager *mode.SchemaManager

	logger *zap.Logger
}

func Request_IsCompressed(request *pb_mode.FindRequest) bool {
	return request != nil && request.Options != nil && request.Options.Compressed
}

///
/// gRPC ENDPOINTS
///

func (server *MODEServer) Find(ctx context.Context, request *pb_mode.FindRequest) (*pb_mode.QueryLayerResponse, error) {
	// Create a "builder" for the request.
	builder := mode.NewFindBuilder(request)

	// Build a query from the request.
	query, err := builder.ToQuery()
	if err != nil {
		server.logger.Error("error while building find() query", zap.Error(err))
		return nil, err
	}
	server.logger.Info("built find() query from request", zap.String("query", query))

	rows, err := server.db.Queryx(query)
	if err != nil {
		server.logger.Error("error while executing find() query", zap.String("query", query), zap.Error(err))
		return nil, err
	}

	defer rows.Close()

	// Get the schama for the table that the query is directed at.
	schema := server.schemaManager.GetSoliditySchema(request.From)
	schemaSolidityType, err := server.schemaManager.SchemaToSolidityType(schema)
	if err != nil {
		server.logger.Error("error while transforming schema to type", zap.Error(err))
		return nil, err
	}
	server.logger.Info("using value type for table", zap.String("table", request.From), zap.String("type", schemaSolidityType.String()))

	// Return data serialized either compressed or uncompressed (up to client).
	//
	// TODO:
	// There are two ways to proceed when returning the results from the find() query.
	//
	//  1. use the serializer code + schema fetcher to serialize. This is the way this is done right now
	//     but there is some clear wasted computation.
	//
	//  2. store raw bytes and return after query with no serialization required. query still needs to make sure to utilize
	//     any indexes but then we don't need to worry about schemas other than at the time of creation (one-time query
	//     for schema from ingress component)
	//
	//     TODO: reach consensus with team if option (2) makes sense and have both available to use. Option 2 is
	//     trivial if raw value is stored.
	if Request_IsCompressed(request) {
		compressedResponse, err := mode.SerializeToCompressed(rows, schemaSolidityType, request.From)
		if err != nil {
			return nil, err
		}
		server.logger.Info("find() rows returned compressed OK", zap.Int("count", len(compressedResponse.Rows)))

		return &pb_mode.QueryLayerResponse{
			IsCompressed:       true,
			ResponseCompressed: compressedResponse,
		}, nil
	} else {
		uncompressedResponse, err := mode.SerializeToUncompressed(rows, schemaSolidityType, request.From)
		if err != nil {
			return nil, err
		}
		server.logger.Info("find() rows returned uncompressed OK", zap.Int("count", len(uncompressedResponse.Rows)))

		return &pb_mode.QueryLayerResponse{
			IsCompressed:         false,
			ResponseUncompressed: uncompressedResponse,
		}, nil
	}
}

func (server *MODEServer) FindAll(ctx context.Context, request *pb_mode.FindAllRequest) (*pb_mode.QueryLayerResponse, error) {
	// Find all available tables.
	allTables, err := server.schemaManager.GetAllTables()
	if err != nil {
		server.logger.Error("error while getting all tables for findAll()", zap.Error(err))
		return nil, err
	}

	// Create a "builder" for the request. An up-to-date list of all tables
	// is used to return the full state, if requested.
	builder := mode.NewFindAllBuilder(request, allTables)

	// Build a query from the request.
	query, err := builder.ToQuery()
	if err != nil {
		server.logger.Error("error while building findAll() query", zap.Error(err))
		return nil, err
	}
	server.logger.Info("built findAll() query from request", zap.String("query", query))

	rows, err := server.db.Queryx(query)
	if err != nil {
		server.logger.Error("error while executing findAll() query", zap.String("query", query), zap.Error(err))
		return nil, err
	}

	defer rows.Close()

	// TODO: decide on serialization of full state or raw vals.

	return &pb_mode.QueryLayerResponse{
		IsCompressed: false,
		ResponseUncompressed: &pb_mode.QueryLayerResponseUncompressed{
			Rows: nil,
		},
	}, nil
}
