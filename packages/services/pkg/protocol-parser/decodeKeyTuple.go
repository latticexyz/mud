package protocolparser

import (
	"strings"

	abi_geth "github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common/hexutil"
)

func decodeAbiParameters(types []string, hexData string) []interface{} {
	args := make(abi_geth.Arguments, 0)

	for _, _type := range types {

		arg := abi_geth.Argument{}
		var err error
		arg.Type, err = abi_geth.NewType(_type, "", nil)
		if err != nil {
			panic(err)
		}
		args = append(args, arg)
	}

	bytes, err := hexutil.Decode(hexData)
	if err != nil {
		panic(err)
	}

	decoding, err := args.UnpackValues(bytes)
	if err != nil {
		panic(err)
	}
	return decoding
}

func DecodeKeyTuple(keySchema Schema, keyTuple []string) []interface{} {
	decoded := make([]interface{}, 0)
	for i, _type := range keySchema.StaticFields {
		abiType := strings.ToLower(_type.String())
		decoded = append(decoded, decodeAbiParameters([]string{abiType}, keyTuple[i])[0])
	}
	return decoded
}
