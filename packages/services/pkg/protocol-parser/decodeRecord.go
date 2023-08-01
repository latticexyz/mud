package protocolparser

import "fmt"

func DecodeRecord(schema Schema, data string) []interface{} {
	values := []interface{}{}

	bytesOffset := 0
	for _, fieldType := range schema.StaticFields {
		fieldByteLength := fieldType.ByteLength()
		value := DecodeStaticField(fieldType, HexSlice(data, bytesOffset, bytesOffset+fieldByteLength))
		bytesOffset += fieldByteLength
		values = append(values, value)
	}

	// Warn user if static data length does not match the schema, because data corruption might be possible
	schemaStaticDataLength := StaticDataLength(schema.StaticFields)
	actualStaticDataLength := bytesOffset
	if schemaStaticDataLength != actualStaticDataLength {
		println(fmt.Sprintf("warning: schema static data length (%d) does not match actual static data length (%d)", schemaStaticDataLength, actualStaticDataLength))
	}

	if len(schema.DynamicFields) > 0 {
		dataLayout := HexToPackedCounter(HexSlice(data, bytesOffset, bytesOffset+32))
		bytesOffset += 32

		for i, fieldType := range schema.DynamicFields {
			dataLength := dataLayout.FieldByteLengths[i]
			value := DecodeDynamicField(fieldType, HexSlice(data, bytesOffset, bytesOffset+int(dataLength)))
			bytesOffset += int(dataLength)
			values = append(values, value)
		}

		// Warn user if dynamic data length does not match the schema, because data corruption might be possible
		actualDynamicDataLength := bytesOffset - 32 - actualStaticDataLength
		if uint64(actualDynamicDataLength) != dataLayout.TotalByteLength {
			println(fmt.Sprintf("warning: schema dynamic data length (%d) does not match actual dynamic data length (%d)", dataLayout.TotalByteLength, actualDynamicDataLength))
		}
	}

	return values
}
