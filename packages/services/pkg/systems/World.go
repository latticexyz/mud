// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package systems

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// WorldMetaData contains all meta data concerning the World contract.
var WorldMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"contractIWorld\",\"name\":\"_world\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"_components\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[{\"internalType\":\"bytes\",\"name\":\"arguments\",\"type\":\"bytes\"}],\"name\":\"execute\",\"outputs\":[{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"entity\",\"type\":\"uint256\"},{\"internalType\":\"string\",\"name\":\"name\",\"type\":\"string\"}],\"name\":\"executeTyped\",\"outputs\":[{\"internalType\":\"bytes\",\"name\":\"\",\"type\":\"bytes\"}],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// WorldABI is the input ABI used to generate the binding from.
// Deprecated: Use WorldMetaData.ABI instead.
var WorldABI = WorldMetaData.ABI

// World is an auto generated Go binding around an Ethereum contract.
type World struct {
	WorldCaller     // Read-only binding to the contract
	WorldTransactor // Write-only binding to the contract
	WorldFilterer   // Log filterer for contract events
}

// WorldCaller is an auto generated read-only Go binding around an Ethereum contract.
type WorldCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// WorldTransactor is an auto generated write-only Go binding around an Ethereum contract.
type WorldTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// WorldFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type WorldFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// WorldSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type WorldSession struct {
	Contract     *World            // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// WorldCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type WorldCallerSession struct {
	Contract *WorldCaller  // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// WorldTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type WorldTransactorSession struct {
	Contract     *WorldTransactor  // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// WorldRaw is an auto generated low-level Go binding around an Ethereum contract.
type WorldRaw struct {
	Contract *World // Generic contract binding to access the raw methods on
}

// WorldCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type WorldCallerRaw struct {
	Contract *WorldCaller // Generic read-only contract binding to access the raw methods on
}

// WorldTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type WorldTransactorRaw struct {
	Contract *WorldTransactor // Generic write-only contract binding to access the raw methods on
}

// NewWorld creates a new instance of World, bound to a specific deployed contract.
func NewWorld(address common.Address, backend bind.ContractBackend) (*World, error) {
	contract, err := bindWorld(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &World{WorldCaller: WorldCaller{contract: contract}, WorldTransactor: WorldTransactor{contract: contract}, WorldFilterer: WorldFilterer{contract: contract}}, nil
}

// NewWorldCaller creates a new read-only instance of World, bound to a specific deployed contract.
func NewWorldCaller(address common.Address, caller bind.ContractCaller) (*WorldCaller, error) {
	contract, err := bindWorld(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &WorldCaller{contract: contract}, nil
}

// NewWorldTransactor creates a new write-only instance of World, bound to a specific deployed contract.
func NewWorldTransactor(address common.Address, transactor bind.ContractTransactor) (*WorldTransactor, error) {
	contract, err := bindWorld(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &WorldTransactor{contract: contract}, nil
}

// NewWorldFilterer creates a new log filterer instance of World, bound to a specific deployed contract.
func NewWorldFilterer(address common.Address, filterer bind.ContractFilterer) (*WorldFilterer, error) {
	contract, err := bindWorld(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &WorldFilterer{contract: contract}, nil
}

// bindWorld binds a generic wrapper to an already deployed contract.
func bindWorld(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(WorldABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_World *WorldRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _World.Contract.WorldCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_World *WorldRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _World.Contract.WorldTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_World *WorldRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _World.Contract.WorldTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_World *WorldCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _World.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_World *WorldTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _World.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_World *WorldTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _World.Contract.contract.Transact(opts, method, params...)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_World *WorldCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var out []interface{}
	err := _World.contract.Call(opts, &out, "owner")

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_World *WorldSession) Owner() (common.Address, error) {
	return _World.Contract.Owner(&_World.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() view returns(address)
func (_World *WorldCallerSession) Owner() (common.Address, error) {
	return _World.Contract.Owner(&_World.CallOpts)
}

// Execute is a paid mutator transaction binding the contract method 0x09c5eabe.
//
// Solidity: function execute(bytes arguments) returns(bytes)
func (_World *WorldTransactor) Execute(opts *bind.TransactOpts, arguments []byte) (*types.Transaction, error) {
	return _World.contract.Transact(opts, "execute", arguments)
}

// Execute is a paid mutator transaction binding the contract method 0x09c5eabe.
//
// Solidity: function execute(bytes arguments) returns(bytes)
func (_World *WorldSession) Execute(arguments []byte) (*types.Transaction, error) {
	return _World.Contract.Execute(&_World.TransactOpts, arguments)
}

// Execute is a paid mutator transaction binding the contract method 0x09c5eabe.
//
// Solidity: function execute(bytes arguments) returns(bytes)
func (_World *WorldTransactorSession) Execute(arguments []byte) (*types.Transaction, error) {
	return _World.Contract.Execute(&_World.TransactOpts, arguments)
}

// ExecuteTyped is a paid mutator transaction binding the contract method 0x68c47df2.
//
// Solidity: function executeTyped(uint256 entity, string name) returns(bytes)
func (_World *WorldTransactor) ExecuteTyped(opts *bind.TransactOpts, entity *big.Int, name string) (*types.Transaction, error) {
	return _World.contract.Transact(opts, "executeTyped", entity, name)
}

// ExecuteTyped is a paid mutator transaction binding the contract method 0x68c47df2.
//
// Solidity: function executeTyped(uint256 entity, string name) returns(bytes)
func (_World *WorldSession) ExecuteTyped(entity *big.Int, name string) (*types.Transaction, error) {
	return _World.Contract.ExecuteTyped(&_World.TransactOpts, entity, name)
}

// ExecuteTyped is a paid mutator transaction binding the contract method 0x68c47df2.
//
// Solidity: function executeTyped(uint256 entity, string name) returns(bytes)
func (_World *WorldTransactorSession) ExecuteTyped(entity *big.Int, name string) (*types.Transaction, error) {
	return _World.Contract.ExecuteTyped(&_World.TransactOpts, entity, name)
}
