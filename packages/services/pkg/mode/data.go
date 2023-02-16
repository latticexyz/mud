package mode

import (
	"latticexyz/mud/packages/services/pkg/logger"
	"latticexyz/mud/packages/services/protobuf/go/mode"
	"time"

	"github.com/umbracle/ethgo/abi"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

func PrepareForScan(rows *sqlx.Rows) (colNames []string, row []string, rowInterface []interface{}) {
	colNames, _ = rows.Columns()
	row = make([]string, len(colNames))
	rowInterface = make([]interface{}, len(colNames))
	for i, _ := range row {
		rowInterface[i] = &row[i]
	}
	return
}

func SerializeSingleRow(row []string, colNames []string, schemaSolidityType *abi.Type) (entityId string, encodedValue []byte, err error) {
	rowStruct := make(map[string]string)

	for i, colName := range colNames {
		if colName == "entityid" {
			println("have entityid column, skipping")
			entityId = row[i]
			// Do not add to the data struct, since the entity ID is sent over the wire separately.
			// Every column other than the entityId is serialized into a value.
			continue
		}
		println(colName + ":")
		println(row[i])

		rowStruct[colName] = row[i]
	}

	println("encoding struct:")
	println(rowStruct)

	// Handle the case of the struct having a single column (value) or multiple columns,
	// in which case the serialization is a struct (tuple). If the value is singular,
	// ABI encoding takes the single value as-is, since the corresponding Solidity type
	// object will contain a singular type. Otherwise, the Solidity type for ABI encoding
	// is a tuple, so we pass in the entire map (untyped struct).

	if len(rowStruct) == 1 {
		encodedValue, err = schemaSolidityType.Encode(rowStruct[colNames[1]])
	} else {
		encodedValue, err = schemaSolidityType.Encode(&rowStruct)
	}
	return
}

// func SerializeToCompressed(rows *sqlx.Rows, schemaSolidityType *abi.Type, tableName string) (*mode.QueryLayerResponse, error) {
// 	tsStart := time.Now()

// 	compressedRows := []*mode.CompressedRow{}
// 	compressedRowsSources := []string{"0x0000000000000000000000000000000000000000"}
// 	compressedRowsEntities := []string{"0x0000000000000000000000000000000000000000"}

// 	// Indexes tracking positions while compressing.
// 	sourceIdx := uint32(1)
// 	entityIdx := uint32(1)

// 	// Map of sources / entities to their position in an array. This helps us
// 	// assign the correct values to CompressedRows as we serialize and compress.
// 	sourceToIdx := map[string]uint32{}
// 	entityToIdx := map[string]uint32{}

// 	colNames, row, rowInterface := PrepareForScan(rows)

// 	if rows.Next() {
// 		rows.Scan(rowInterface...)
// 		entityId, encodedValue, err := SerializeSingleRow(row, colNames, schemaSolidityType)
// 		if err != nil {
// 			return nil, err
// 		}

// 		println("encodedValue:")
// 		println(encodedValue)

// 		// Since the response is compressed, add to array of entities and update the ID.
// 		if _, ok := entityToIdx[entityId]; !ok {
// 			compressedRowsEntities = append(compressedRowsEntities, entityId)
// 			entityToIdx[entityId] = entityIdx
// 			entityIdx++
// 		}

// 		// Do the same for source.
// 		// TODO: since this function right now is per-table, it doesn't require
// 		// this logic.
// 		if _, ok := sourceToIdx[tableName]; !ok {
// 			compressedRowsSources = append(compressedRowsSources, tableName)
// 			sourceToIdx[tableName] = sourceIdx
// 			sourceIdx++
// 		}

// 		compressedRows = append(compressedRows, &mode.CompressedRow{
// 			SourceIdx:   sourceToIdx[tableName],
// 			EntityIdIdx: entityToIdx[entityId],
// 			Value:       encodedValue,
// 		})
// 	}

// 	if err := rows.Err(); err != nil {
// 		return nil, err
// 	}

// 	// Record how long the serialization took.
// 	tsElapsed := time.Since(tsStart)
// 	logger.GetLogger().Info("serialization (compressed) finished", zap.String("time taken", tsElapsed.String()))

// 	return &mode.QueryLayerResponseCompressed{
// 		Rows:        compressedRows,
// 		RowSources:  compressedRowsSources,
// 		RowEntities: compressedRowsEntities,
// 	}, nil
// }

// func SerializeToUncompressed(rows *sqlx.Rows, schemaSolidityType *abi.Type, tableName string) (*mode.QueryLayerResponseUncompressed, error) {
// 	tsStart := time.Now()

// 	uncompressedRows := []*mode.UncompressedRow{}
// 	colNames, row, rowInterface := PrepareForScan(rows)

// 	if rows.Next() {
// 		rows.Scan(rowInterface...)
// 		entityId, encodedValue, err := SerializeSingleRow(row, colNames, schemaSolidityType)
// 		if err != nil {
// 			return nil, err
// 		}

// 		println("encodedValue:")
// 		println(encodedValue)

// 		uncompressedRows = append(uncompressedRows, &mode.UncompressedRow{
// 			Source:   tableName,
// 			EntityId: entityId,
// 			Value:    encodedValue,
// 		})
// 	}

// 	if err := rows.Err(); err != nil {
// 		return nil, err
// 	}
// 	// Record how long the serialization took.
// 	tsElapsed := time.Since(tsStart)
// 	logger.GetLogger().Info("serialization (uncompressed) finished", zap.String("time taken", tsElapsed.String()))

// 	return &mode.QueryLayerResponseUncompressed{
// 		Rows: uncompressedRows,
// 	}, nil
// }

func SerializeRow(row []string, colNames []string, colTypes []*abi.Type) (*mode.Row, error) {
	// A single row but every field is encoded.
	values := [][]byte{}

	// Iterate columns and serialize each field for this row.
	for i, colName := range colNames {
		colType := colTypes[i]

		println(colType.String())
		println(colName + ":")
		println(row[i])

		encodedField, err := colType.Encode(row[i])
		if err != nil {
			return nil, err
		}

		values = append(values, encodedField)
	}

	return &mode.Row{
		Values: values,
	}, nil
}

func SerializeRows(rows *sqlx.Rows, colTypes []*abi.Type, colTypeStrings []string) (*mode.QueryLayerResponse, error) {
	tsStart := time.Now()

	colNames, row, rowInterface := PrepareForScan(rows)
	serializedRows := []*mode.Row{}

	if rows.Next() {
		rows.Scan(rowInterface...)
		serializedRow, err := SerializeRow(row, colNames, colTypes)
		if err != nil {
			logger.GetLogger().Error("error while serializing", zap.Error(err))
			return nil, err
		}

		println("serializedRow:")
		println(serializedRow)

		serializedRows = append(serializedRows, serializedRow)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Record how long the serialization took.
	tsElapsed := time.Since(tsStart)
	logger.GetLogger().Info("serialization finished", zap.String("time taken", tsElapsed.String()))

	return &mode.QueryLayerResponse{
		Cols:   colNames,
		Rows:   serializedRows,
		Schema: colTypeStrings,
	}, nil
}
