package storecore

import (
	"fmt"
	"latticexyz/mud/packages/services/pkg/logger"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"go.uber.org/zap"
)

type SchemaType uint64

const (
	UINT8 SchemaType = iota
	UINT16
	UINT24
	UINT32
	UINT40
	UINT48
	UINT56
	UINT64
	UINT72
	UINT80
	UINT88
	UINT96
	UINT104
	UINT112
	UINT120
	UINT128
	UINT136
	UINT144
	UINT152
	UINT160
	UINT168
	UINT176
	UINT184
	UINT192
	UINT200
	UINT208
	UINT216
	UINT224
	UINT232
	UINT240
	UINT248
	UINT256
	INT8
	INT16
	INT24
	INT32
	INT40
	INT48
	INT56
	INT64
	INT72
	INT80
	INT88
	INT96
	INT104
	INT112
	INT120
	INT128
	INT136
	INT144
	INT152
	INT160
	INT168
	INT176
	INT184
	INT192
	INT200
	INT208
	INT216
	INT224
	INT232
	INT240
	INT248
	INT256
	BYTES1
	BYTES2
	BYTES3
	BYTES4
	BYTES5
	BYTES6
	BYTES7
	BYTES8
	BYTES9
	BYTES10
	BYTES11
	BYTES12
	BYTES13
	BYTES14
	BYTES15
	BYTES16
	BYTES17
	BYTES18
	BYTES19
	BYTES20
	BYTES21
	BYTES22
	BYTES23
	BYTES24
	BYTES25
	BYTES26
	BYTES27
	BYTES28
	BYTES29
	BYTES30
	BYTES31
	BYTES32
	BOOL
	ADDRESS
	UINT8_ARRAY
	UINT16_ARRAY
	UINT24_ARRAY
	UINT32_ARRAY
	UINT40_ARRAY
	UINT48_ARRAY
	UINT56_ARRAY
	UINT64_ARRAY
	UINT72_ARRAY
	UINT80_ARRAY
	UINT88_ARRAY
	UINT96_ARRAY
	UINT104_ARRAY
	UINT112_ARRAY
	UINT120_ARRAY
	UINT128_ARRAY
	UINT136_ARRAY
	UINT144_ARRAY
	UINT152_ARRAY
	UINT160_ARRAY
	UINT168_ARRAY
	UINT176_ARRAY
	UINT184_ARRAY
	UINT192_ARRAY
	UINT200_ARRAY
	UINT208_ARRAY
	UINT216_ARRAY
	UINT224_ARRAY
	UINT232_ARRAY
	UINT240_ARRAY
	UINT248_ARRAY
	UINT256_ARRAY
	INT8_ARRAY
	INT16_ARRAY
	INT24_ARRAY
	INT32_ARRAY
	INT40_ARRAY
	INT48_ARRAY
	INT56_ARRAY
	INT64_ARRAY
	INT72_ARRAY
	INT80_ARRAY
	INT88_ARRAY
	INT96_ARRAY
	INT104_ARRAY
	INT112_ARRAY
	INT120_ARRAY
	INT128_ARRAY
	INT136_ARRAY
	INT144_ARRAY
	INT152_ARRAY
	INT160_ARRAY
	INT168_ARRAY
	INT176_ARRAY
	INT184_ARRAY
	INT192_ARRAY
	INT200_ARRAY
	INT208_ARRAY
	INT216_ARRAY
	INT224_ARRAY
	INT232_ARRAY
	INT240_ARRAY
	INT248_ARRAY
	INT256_ARRAY
	BYTES1_ARRAY
	BYTES2_ARRAY
	BYTES3_ARRAY
	BYTES4_ARRAY
	BYTES5_ARRAY
	BYTES6_ARRAY
	BYTES7_ARRAY
	BYTES8_ARRAY
	BYTES9_ARRAY
	BYTES10_ARRAY
	BYTES11_ARRAY
	BYTES12_ARRAY
	BYTES13_ARRAY
	BYTES14_ARRAY
	BYTES15_ARRAY
	BYTES16_ARRAY
	BYTES17_ARRAY
	BYTES18_ARRAY
	BYTES19_ARRAY
	BYTES20_ARRAY
	BYTES21_ARRAY
	BYTES22_ARRAY
	BYTES23_ARRAY
	BYTES24_ARRAY
	BYTES25_ARRAY
	BYTES26_ARRAY
	BYTES27_ARRAY
	BYTES28_ARRAY
	BYTES29_ARRAY
	BYTES30_ARRAY
	BYTES31_ARRAY
	BYTES32_ARRAY
	BOOL_ARRAY
	ADDRESS_ARRAY
	BYTES
	STRING
)

type SchemaTypeKV struct {
	Key   *SchemaTypePair `json:"key"`
	Value *SchemaTypePair `json:"value"`
}

func (pair *SchemaTypeKV) Flatten() []SchemaType {
	return append(pair.Key.Flatten(), pair.Value.Flatten()...)
}

type SchemaTypePair struct {
	Static           []SchemaType `json:"static"`
	Dynamic          []SchemaType `json:"dynamic"`
	StaticDataLength uint64       `json:"static_data_length"`
}

func (tuple *SchemaTypePair) Flatten() []SchemaType {
	return append(tuple.Static, tuple.Dynamic...)
}

func DecodeSchemaTypePair(encoding []byte) *SchemaTypePair {

	staticDataLength := new(big.Int).SetBytes(encoding[0:2]).Uint64()
	numStaticFields := new(big.Int).SetBytes(encoding[2:3]).Uint64()
	numDynamicFields := new(big.Int).SetBytes(encoding[3:4]).Uint64()

	staticFields := []SchemaType{}
	dynamicFields := []SchemaType{}

	var i uint64
	for i = 4; i < 4+numStaticFields; i++ {
		staticFields = append(staticFields, SchemaType(encoding[i]))
	}
	for i = 4 + numStaticFields; i < 4+numStaticFields+numDynamicFields; i++ {
		dynamicFields = append(dynamicFields, SchemaType(encoding[i]))
	}

	return &SchemaTypePair{
		Static:           staticFields,
		Dynamic:          dynamicFields,
		StaticDataLength: staticDataLength,
	}
}

func SchemaTypeKVFromPairs(key *SchemaTypePair, value *SchemaTypePair) *SchemaTypeKV {
	return &SchemaTypeKV{
		Key:   key,
		Value: value,
	}
}

func CombineSchemaTypePair(schemaTypePair SchemaTypePair) []SchemaType {
	return schemaTypePair.Flatten()
}

func StringifySchemaTypes(schemaType []SchemaType) []string {
	var types []string
	for _, t := range schemaType {
		types = append(types, strings.ToLower(t.String()))
	}
	return types
}

func CombineStringifySchemaTypes(schemaType []SchemaType) string {
	return strings.Join(StringifySchemaTypes(schemaType), ",")
}

type DataSchemaTypePair struct {
	Data       string
	SchemaType SchemaType
}

type DecodedData struct {
	data        map[string]*DataSchemaTypePair
	schemaTypes []SchemaType
}

func NewDecodedData(schemaTypePair SchemaTypePair) *DecodedData {
	return &DecodedData{
		data:        map[string]*DataSchemaTypePair{},
		schemaTypes: CombineSchemaTypePair(schemaTypePair),
	}
}

func (d *DecodedData) Length() int {
	return len(d.schemaTypes)
}

func (d *DecodedData) Set(key string, value *DataSchemaTypePair) {
	d.data[key] = value
}

func (d *DecodedData) Get(key string) *DataSchemaTypePair {
	return d.data[key]
}

func (d *DecodedData) At(index int) *DataSchemaTypePair {
	return d.data[d.schemaTypes[index].String()]
}

func (d *DecodedData) DataAt(index int) string {
	return d.At(index).Data
}

func (d *DecodedData) SchemaTypeAt(index int) SchemaType {
	return d.At(index).SchemaType
}

func (d *DecodedData) SchemaTypes() []SchemaType {
	return d.schemaTypes
}

func DecodeDataField(encoding []byte, schemaTypePair SchemaTypePair, index uint8) string {
	// Try to decode either as a static or dynamic field.
	for idx, fieldType := range schemaTypePair.Static {
		if uint8(idx) == index {
			return DecodeStaticField(fieldType, encoding, 0)
		}
	}
	for idx, fieldType := range schemaTypePair.Dynamic {
		// Offset by the static data length.
		if uint8(idx+len(schemaTypePair.Static)) == index {
			return DecodeDynamicField(fieldType, encoding)
		}
	}
	logger.GetLogger().Fatal("could not decode data field at index", zap.Uint8("index", index))
	return ""
}

// TODO: To minimize bugs/diff the decoding function (and others) are following
// @frolic's TS implementation in the client sync patch. We should coordinate
// whether or not we want to keep the code exactly the same or if we want to
// refactor / implement in a more idiomatic way.
func DecodeData(encoding []byte, schemaTypePair SchemaTypePair) *DecodedData {
	var bytesOffset uint64 = 0

	// Where the decoded data is stored.
	data := NewDecodedData(schemaTypePair)

	// Decode static fields.
	for _, fieldType := range schemaTypePair.Static {
		value := DecodeStaticField(fieldType, encoding, bytesOffset)
		bytesOffset += getStaticByteLength(fieldType)

		// Save a mapping of FIELD TYPE (string) -> (FIELD VALUE (interface{}), FIELD TYPE (SchemaType))
		data.Set(fieldType.String(), &DataSchemaTypePair{
			Data:       value,
			SchemaType: fieldType,
		})
	}

	// Decode dynamic fields.
	if len(schemaTypePair.Dynamic) > 0 {
		dynamicDataSlice := encoding[schemaTypePair.StaticDataLength : schemaTypePair.StaticDataLength+32]
		bytesOffset += 32

		for i, fieldType := range schemaTypePair.Dynamic {
			offset := 4 + i*2
			dataLength := new(big.Int).SetBytes(dynamicDataSlice[offset : offset+2]).Uint64()
			value := DecodeDynamicField(fieldType, encoding[bytesOffset:bytesOffset+dataLength])
			bytesOffset += dataLength

			// Save a mapping of FIELD TYPE (string) -> (FIELD VALUE (interface{}), FIELD TYPE (SchemaType))
			data.Set(fieldType.String(), &DataSchemaTypePair{
				Data:       value,
				SchemaType: fieldType,
			})

		}
	}

	return data
}

func DecodeDynamicField(schemaType SchemaType, encodingSlice []byte) string {
	switch schemaType {
	case BYTES:
		return hexutil.Encode(encodingSlice)
	case STRING:
		return string(encodingSlice)
	default:
		logger.GetLogger().Fatal("Unknown dynamic field type", zap.String("type", schemaType.String()))
		return ""
	}
}

func DecodeStaticField(schemaType SchemaType, encoding []byte, bytesOffset uint64) string {
	switch schemaType {
	case UINT8:
		return fmt.Sprint(new(big.Int).SetBytes(encoding[bytesOffset : bytesOffset+1]).Uint64())
	case UINT16:
		return fmt.Sprint(new(big.Int).SetBytes(encoding[bytesOffset : bytesOffset+2]).Uint64())
	case UINT32:
		return fmt.Sprint(new(big.Int).SetBytes(encoding[bytesOffset : bytesOffset+4]).Uint64())
	case UINT64:
		return fmt.Sprint(new(big.Int).SetBytes(encoding[bytesOffset : bytesOffset+8]).Uint64())
	case UINT128:
		return fmt.Sprint(new(big.Int).SetBytes(encoding[bytesOffset : bytesOffset+16]).Uint64())
	case UINT256:
		return fmt.Sprint(new(big.Int).SetBytes(encoding[bytesOffset : bytesOffset+32]).Uint64())
	case BYTES4:
		return hexutil.Encode(encoding[bytesOffset : bytesOffset+4])
	case BYTES8:
		return hexutil.Encode(encoding[bytesOffset : bytesOffset+8])
	case BYTES16:
		return hexutil.Encode(encoding[bytesOffset : bytesOffset+16])
	case BYTES32:
		return hexutil.Encode(encoding[bytesOffset : bytesOffset+32])
	case BOOL:
		if encoding[bytesOffset] == 1 {
			return "true"
		} else {
			return "false"
		}
	case ADDRESS:
		return common.BytesToAddress(encoding[bytesOffset : bytesOffset+20]).String()
	default:
		logger.GetLogger().Fatal("Unknown static field type", zap.String("type", schemaType.String()))
		return ""
	}
}

func getStaticByteLength(schemaType SchemaType) uint64 {
	if schemaType < 32 {
		// uint8-256
		return uint64(schemaType) + 1
	} else if schemaType < 64 {
		// int8-256, offset by 32
		return uint64(schemaType) + 1 - 32
	} else if schemaType < 96 {
		// bytes1-32, offset by 64
		return uint64(schemaType) + 1 - 64
	}

	// Other static types
	if schemaType == BOOL {
		return 1
	} else if schemaType == ADDRESS {
		return 20
	}

	// Return 0 for all dynamic types
	return 0
}

func SchemaTypeToSolidityType(schemaType SchemaType) string {
	if strings.Contains(schemaType.String(), "ARRAY") {
		_type := strings.Split(schemaType.String(), "_")[0]
		return fmt.Sprintf("%s[]", strings.ToLower(_type))
	} else {
		return strings.ToLower(schemaType.String())
	}
}

func SchemaTypeToPostgresType(schemaType SchemaType) string {
	if (schemaType >= UINT8 && schemaType <= UINT32) || (schemaType >= INT8 && schemaType <= INT32) {
		// Integer.
		return "integer"
	} else if (schemaType >= UINT64 && schemaType <= UINT256) || (schemaType >= INT64 && schemaType <= INT256) {
		// Big integer.
		return "text"
	} else if (schemaType >= BYTES1 && schemaType <= BYTES32) || (schemaType == BYTES) {
		// Bytes.
		return "bytea"
	} else if schemaType == BOOL {
		// Boolean.
		return "boolean"
	} else if schemaType == ADDRESS {
		// Address.
		return "text"
	} else if schemaType == STRING {
		// String.
		return "text"
	} else if (schemaType >= UINT8_ARRAY && schemaType <= UINT32_ARRAY) || (schemaType >= INT8_ARRAY && schemaType <= INT32_ARRAY) {
		// Integer array.
		return "integer[]"
	} else if (schemaType >= UINT64_ARRAY && schemaType <= UINT256_ARRAY) || (schemaType >= INT64_ARRAY && schemaType <= INT256_ARRAY) {
		// Big integer array.
		return "text[]"
	} else if schemaType >= BYTES1_ARRAY && schemaType <= BYTES32_ARRAY {
		// Bytes array.
		return "bytea[]"
	} else if schemaType == BOOL_ARRAY {
		// Boolean array.
		return "boolean[]"
	} else if schemaType == ADDRESS_ARRAY {
		// Address array.
		return "text[]"
	} else {
		// Default to text.
		return "text"
	}
}
