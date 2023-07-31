package protocolparser

import (
	. "latticexyz/mud/packages/services/pkg/schema-type"

	"github.com/andriidski/abiencode-go/convert"
)

func DecodeStaticField(schemaType SchemaType, data string) interface{} {
	if len(data) > 3 && len(data)%2 != 0 {
		panic(ErrInvalidHexLength)
	}

	dataSize := (len(data) - 2) / 2
	if dataSize != StaticAbiTypeToByteLength(schemaType) {
		panic(ErrInvalidHexLengthForStaticField)
	}

	switch schemaType {
	case UINT8:
		return convert.HexToUint8(data)
	case UINT16:
		return convert.HexToUint16(data)
	case UINT24, UINT32:
		return convert.HexToUint32(data)
	case UINT40,
		UINT48,
		UINT56,
		UINT64:
		return convert.HexToUint64(data)
	case UINT72,
		UINT80,
		UINT88,
		UINT96,
		UINT104,
		UINT112,
		UINT120,
		UINT128,
		UINT136,
		UINT144,
		UINT152,
		UINT160,
		UINT168,
		UINT176,
		UINT184,
		UINT192,
		UINT200,
		UINT208,
		UINT216,
		UINT224,
		UINT232,
		UINT240,
		UINT248,
		UINT256:
		return convert.HexToBigInt(data)
	case INT8:
		return convert.HexToInt8(data)
	case INT16:
		return convert.HexToInt16(data)
	case INT24, INT32:
		return convert.HexToInt32(data)
	case INT40,
		INT48,
		INT56,
		INT64:
		return convert.HexToInt64(data)
	case INT72,
		INT80,
		INT88,
		INT96,
		INT104,
		INT112,
		INT120,
		INT128,
		INT136,
		INT144,
		INT152,
		INT160,
		INT168,
		INT176,
		INT184,
		INT192,
		INT200,
		INT208,
		INT216,
		INT224,
		INT232,
		INT240,
		INT248,
		INT256:
		return convert.HexToBigIntSigned(data)
	case BYTES1,
		BYTES2,
		BYTES3,
		BYTES4,
		BYTES5,
		BYTES6,
		BYTES7,
		BYTES8,
		BYTES9,
		BYTES10,
		BYTES11,
		BYTES12,
		BYTES13,
		BYTES14,
		BYTES15,
		BYTES16,
		BYTES17,
		BYTES18,
		BYTES19,
		BYTES20,
		BYTES21,
		BYTES22,
		BYTES23,
		BYTES24,
		BYTES25,
		BYTES26,
		BYTES27,
		BYTES28,
		BYTES29,
		BYTES30,
		BYTES31,
		BYTES32:
		// TODO: should we return a fixed size array per bytes size or a slice?
		return convert.HexToBytes(data)
	case BOOL:
		return convert.HexToBool(data)
	case ADDRESS:
		return convert.HexToAddress(data)
	default:
		panic("unsupported type")
	}
}
