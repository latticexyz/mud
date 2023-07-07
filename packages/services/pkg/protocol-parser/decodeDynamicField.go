package protocolparser

import (
	. "latticexyz/mud/packages/services/pkg/schema-type"

	"github.com/andriidski/abiencode-go/convert"
)

func DecodeDynamicField(schemaType SchemaType, data string) interface{} {
	if schemaType == BYTES {
		return convert.HexToBytes(data)
	}
	if schemaType == STRING {
		return convert.HexToString(data)
	}

	if len(data) > 3 && len(data)%2 != 0 {
		panic(ErrInvalidHexLength)
	}

	dataSize := (len(data) - 2) / 2

	switch schemaType {
	case UINT8_ARRAY,
		UINT16_ARRAY,
		UINT24_ARRAY,
		UINT32_ARRAY,
		UINT40_ARRAY,
		UINT48_ARRAY,
		UINT56_ARRAY,
		UINT64_ARRAY,
		UINT72_ARRAY,
		UINT80_ARRAY,
		UINT88_ARRAY,
		UINT96_ARRAY,
		UINT104_ARRAY,
		UINT112_ARRAY,
		UINT120_ARRAY,
		UINT128_ARRAY,
		UINT136_ARRAY,
		UINT144_ARRAY,
		UINT152_ARRAY,
		UINT160_ARRAY,
		UINT168_ARRAY,
		UINT176_ARRAY,
		UINT184_ARRAY,
		UINT192_ARRAY,
		UINT200_ARRAY,
		UINT208_ARRAY,
		UINT216_ARRAY,
		UINT224_ARRAY,
		UINT232_ARRAY,
		UINT240_ARRAY,
		UINT248_ARRAY,
		UINT256_ARRAY,
		INT8_ARRAY,
		INT16_ARRAY,
		INT24_ARRAY,
		INT32_ARRAY,
		INT40_ARRAY,
		INT48_ARRAY,
		INT56_ARRAY,
		INT64_ARRAY,
		INT72_ARRAY,
		INT80_ARRAY,
		INT88_ARRAY,
		INT96_ARRAY,
		INT104_ARRAY,
		INT112_ARRAY,
		INT120_ARRAY,
		INT128_ARRAY,
		INT136_ARRAY,
		INT144_ARRAY,
		INT152_ARRAY,
		INT160_ARRAY,
		INT168_ARRAY,
		INT176_ARRAY,
		INT184_ARRAY,
		INT192_ARRAY,
		INT200_ARRAY,
		INT208_ARRAY,
		INT216_ARRAY,
		INT224_ARRAY,
		INT232_ARRAY,
		INT240_ARRAY,
		INT248_ARRAY,
		INT256_ARRAY,
		BYTES1_ARRAY,
		BYTES2_ARRAY,
		BYTES3_ARRAY,
		BYTES4_ARRAY,
		BYTES5_ARRAY,
		BYTES6_ARRAY,
		BYTES7_ARRAY,
		BYTES8_ARRAY,
		BYTES9_ARRAY,
		BYTES10_ARRAY,
		BYTES11_ARRAY,
		BYTES12_ARRAY,
		BYTES13_ARRAY,
		BYTES14_ARRAY,
		BYTES15_ARRAY,
		BYTES16_ARRAY,
		BYTES17_ARRAY,
		BYTES18_ARRAY,
		BYTES19_ARRAY,
		BYTES20_ARRAY,
		BYTES21_ARRAY,
		BYTES22_ARRAY,
		BYTES23_ARRAY,
		BYTES24_ARRAY,
		BYTES25_ARRAY,
		BYTES26_ARRAY,
		BYTES27_ARRAY,
		BYTES28_ARRAY,
		BYTES29_ARRAY,
		BYTES30_ARRAY,
		BYTES31_ARRAY,
		BYTES32_ARRAY,
		ADDRESS_ARRAY,
		BOOL_ARRAY:
		staticAbiType := ArrayAbiTypeToStaticAbiType(schemaType)
		itemByteLength := staticAbiType.ByteLength()
		if dataSize%itemByteLength != 0 {
			panic(ErrInvalidHexLengthForArrayField)
		}
		itemCount := dataSize / int(itemByteLength)
		items := make([]interface{}, itemCount)
		for i := 0; i < itemCount; i++ {
			itemData := HexSlice(data, i*itemByteLength, (i+1)*itemByteLength)
			items[i] = DecodeStaticField(staticAbiType, itemData)
		}
		return items
	default:
		panic("unsupported type")
	}
}
