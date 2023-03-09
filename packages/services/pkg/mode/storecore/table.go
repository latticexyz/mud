package storecore

import "github.com/ethereum/go-ethereum/crypto"

func SchemaTable() string {
	return crypto.Keccak256Hash([]byte("mud.store.table.schema")).Hex()
}

func MetadataTable() string {
	return crypto.Keccak256Hash([]byte("/store_internals/tables/StoreMetadata")).Hex()
}
