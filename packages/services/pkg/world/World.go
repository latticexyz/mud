// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package world

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
	ABI: "[{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"componentId\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"component\",\"type\":\"address\"}],\"name\":\"ComponentRegistered\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"componentId\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"component\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"entity\",\"type\":\"uint256\"}],\"name\":\"ComponentValueRemoved\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"componentId\",\"type\":\"uint256\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"component\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"entity\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"ComponentValueSet\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"}],\"name\":\"getComponent\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"componentAddr\",\"type\":\"address\"}],\"name\":\"getComponentIdFromAddress\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getNumEntities\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"entity\",\"type\":\"uint256\"}],\"name\":\"hasEntity\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"componentAddr\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"id\",\"type\":\"uint256\"}],\"name\":\"registerComponent\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"component\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"entity\",\"type\":\"uint256\"}],\"name\":\"registerComponentValueRemoved\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"component\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"entity\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"registerComponentValueSet\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
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

// GetComponent is a free data retrieval call binding the contract method 0x4f27da18.
//
// Solidity: function getComponent(uint256 id) view returns(address)
func (_World *WorldCaller) GetComponent(opts *bind.CallOpts, id *big.Int) (common.Address, error) {
	var out []interface{}
	err := _World.contract.Call(opts, &out, "getComponent", id)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// GetComponent is a free data retrieval call binding the contract method 0x4f27da18.
//
// Solidity: function getComponent(uint256 id) view returns(address)
func (_World *WorldSession) GetComponent(id *big.Int) (common.Address, error) {
	return _World.Contract.GetComponent(&_World.CallOpts, id)
}

// GetComponent is a free data retrieval call binding the contract method 0x4f27da18.
//
// Solidity: function getComponent(uint256 id) view returns(address)
func (_World *WorldCallerSession) GetComponent(id *big.Int) (common.Address, error) {
	return _World.Contract.GetComponent(&_World.CallOpts, id)
}

// GetComponentIdFromAddress is a free data retrieval call binding the contract method 0x9f54f545.
//
// Solidity: function getComponentIdFromAddress(address componentAddr) view returns(uint256)
func (_World *WorldCaller) GetComponentIdFromAddress(opts *bind.CallOpts, componentAddr common.Address) (*big.Int, error) {
	var out []interface{}
	err := _World.contract.Call(opts, &out, "getComponentIdFromAddress", componentAddr)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetComponentIdFromAddress is a free data retrieval call binding the contract method 0x9f54f545.
//
// Solidity: function getComponentIdFromAddress(address componentAddr) view returns(uint256)
func (_World *WorldSession) GetComponentIdFromAddress(componentAddr common.Address) (*big.Int, error) {
	return _World.Contract.GetComponentIdFromAddress(&_World.CallOpts, componentAddr)
}

// GetComponentIdFromAddress is a free data retrieval call binding the contract method 0x9f54f545.
//
// Solidity: function getComponentIdFromAddress(address componentAddr) view returns(uint256)
func (_World *WorldCallerSession) GetComponentIdFromAddress(componentAddr common.Address) (*big.Int, error) {
	return _World.Contract.GetComponentIdFromAddress(&_World.CallOpts, componentAddr)
}

// GetNumEntities is a free data retrieval call binding the contract method 0xd7ecf62b.
//
// Solidity: function getNumEntities() view returns(uint256)
func (_World *WorldCaller) GetNumEntities(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _World.contract.Call(opts, &out, "getNumEntities")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetNumEntities is a free data retrieval call binding the contract method 0xd7ecf62b.
//
// Solidity: function getNumEntities() view returns(uint256)
func (_World *WorldSession) GetNumEntities() (*big.Int, error) {
	return _World.Contract.GetNumEntities(&_World.CallOpts)
}

// GetNumEntities is a free data retrieval call binding the contract method 0xd7ecf62b.
//
// Solidity: function getNumEntities() view returns(uint256)
func (_World *WorldCallerSession) GetNumEntities() (*big.Int, error) {
	return _World.Contract.GetNumEntities(&_World.CallOpts)
}

// HasEntity is a free data retrieval call binding the contract method 0xe3d12875.
//
// Solidity: function hasEntity(uint256 entity) view returns(bool)
func (_World *WorldCaller) HasEntity(opts *bind.CallOpts, entity *big.Int) (bool, error) {
	var out []interface{}
	err := _World.contract.Call(opts, &out, "hasEntity", entity)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// HasEntity is a free data retrieval call binding the contract method 0xe3d12875.
//
// Solidity: function hasEntity(uint256 entity) view returns(bool)
func (_World *WorldSession) HasEntity(entity *big.Int) (bool, error) {
	return _World.Contract.HasEntity(&_World.CallOpts, entity)
}

// HasEntity is a free data retrieval call binding the contract method 0xe3d12875.
//
// Solidity: function hasEntity(uint256 entity) view returns(bool)
func (_World *WorldCallerSession) HasEntity(entity *big.Int) (bool, error) {
	return _World.Contract.HasEntity(&_World.CallOpts, entity)
}

// RegisterComponent is a paid mutator transaction binding the contract method 0xf3034770.
//
// Solidity: function registerComponent(address componentAddr, uint256 id) returns()
func (_World *WorldTransactor) RegisterComponent(opts *bind.TransactOpts, componentAddr common.Address, id *big.Int) (*types.Transaction, error) {
	return _World.contract.Transact(opts, "registerComponent", componentAddr, id)
}

// RegisterComponent is a paid mutator transaction binding the contract method 0xf3034770.
//
// Solidity: function registerComponent(address componentAddr, uint256 id) returns()
func (_World *WorldSession) RegisterComponent(componentAddr common.Address, id *big.Int) (*types.Transaction, error) {
	return _World.Contract.RegisterComponent(&_World.TransactOpts, componentAddr, id)
}

// RegisterComponent is a paid mutator transaction binding the contract method 0xf3034770.
//
// Solidity: function registerComponent(address componentAddr, uint256 id) returns()
func (_World *WorldTransactorSession) RegisterComponent(componentAddr common.Address, id *big.Int) (*types.Transaction, error) {
	return _World.Contract.RegisterComponent(&_World.TransactOpts, componentAddr, id)
}

// RegisterComponentValueRemoved is a paid mutator transaction binding the contract method 0xd803064a.
//
// Solidity: function registerComponentValueRemoved(address component, uint256 entity) returns()
func (_World *WorldTransactor) RegisterComponentValueRemoved(opts *bind.TransactOpts, component common.Address, entity *big.Int) (*types.Transaction, error) {
	return _World.contract.Transact(opts, "registerComponentValueRemoved", component, entity)
}

// RegisterComponentValueRemoved is a paid mutator transaction binding the contract method 0xd803064a.
//
// Solidity: function registerComponentValueRemoved(address component, uint256 entity) returns()
func (_World *WorldSession) RegisterComponentValueRemoved(component common.Address, entity *big.Int) (*types.Transaction, error) {
	return _World.Contract.RegisterComponentValueRemoved(&_World.TransactOpts, component, entity)
}

// RegisterComponentValueRemoved is a paid mutator transaction binding the contract method 0xd803064a.
//
// Solidity: function registerComponentValueRemoved(address component, uint256 entity) returns()
func (_World *WorldTransactorSession) RegisterComponentValueRemoved(component common.Address, entity *big.Int) (*types.Transaction, error) {
	return _World.Contract.RegisterComponentValueRemoved(&_World.TransactOpts, component, entity)
}

// RegisterComponentValueSet is a paid mutator transaction binding the contract method 0xaf104e40.
//
// Solidity: function registerComponentValueSet(address component, uint256 entity, bytes data) returns()
func (_World *WorldTransactor) RegisterComponentValueSet(opts *bind.TransactOpts, component common.Address, entity *big.Int, data []byte) (*types.Transaction, error) {
	return _World.contract.Transact(opts, "registerComponentValueSet", component, entity, data)
}

// RegisterComponentValueSet is a paid mutator transaction binding the contract method 0xaf104e40.
//
// Solidity: function registerComponentValueSet(address component, uint256 entity, bytes data) returns()
func (_World *WorldSession) RegisterComponentValueSet(component common.Address, entity *big.Int, data []byte) (*types.Transaction, error) {
	return _World.Contract.RegisterComponentValueSet(&_World.TransactOpts, component, entity, data)
}

// RegisterComponentValueSet is a paid mutator transaction binding the contract method 0xaf104e40.
//
// Solidity: function registerComponentValueSet(address component, uint256 entity, bytes data) returns()
func (_World *WorldTransactorSession) RegisterComponentValueSet(component common.Address, entity *big.Int, data []byte) (*types.Transaction, error) {
	return _World.Contract.RegisterComponentValueSet(&_World.TransactOpts, component, entity, data)
}

// WorldComponentRegisteredIterator is returned from FilterComponentRegistered and is used to iterate over the raw logs and unpacked data for ComponentRegistered events raised by the World contract.
type WorldComponentRegisteredIterator struct {
	Event *WorldComponentRegistered // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *WorldComponentRegisteredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(WorldComponentRegistered)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(WorldComponentRegistered)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *WorldComponentRegisteredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *WorldComponentRegisteredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// WorldComponentRegistered represents a ComponentRegistered event raised by the World contract.
type WorldComponentRegistered struct {
	ComponentId *big.Int
	Component   common.Address
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterComponentRegistered is a free log retrieval operation binding the contract event 0xe065b93b78fd9ec871610269cc875e4f300f3cf0ed219355a75c09ffdc72c185.
//
// Solidity: event ComponentRegistered(uint256 indexed componentId, address component)
func (_World *WorldFilterer) FilterComponentRegistered(opts *bind.FilterOpts, componentId []*big.Int) (*WorldComponentRegisteredIterator, error) {

	var componentIdRule []interface{}
	for _, componentIdItem := range componentId {
		componentIdRule = append(componentIdRule, componentIdItem)
	}

	logs, sub, err := _World.contract.FilterLogs(opts, "ComponentRegistered", componentIdRule)
	if err != nil {
		return nil, err
	}
	return &WorldComponentRegisteredIterator{contract: _World.contract, event: "ComponentRegistered", logs: logs, sub: sub}, nil
}

// WatchComponentRegistered is a free log subscription operation binding the contract event 0xe065b93b78fd9ec871610269cc875e4f300f3cf0ed219355a75c09ffdc72c185.
//
// Solidity: event ComponentRegistered(uint256 indexed componentId, address component)
func (_World *WorldFilterer) WatchComponentRegistered(opts *bind.WatchOpts, sink chan<- *WorldComponentRegistered, componentId []*big.Int) (event.Subscription, error) {

	var componentIdRule []interface{}
	for _, componentIdItem := range componentId {
		componentIdRule = append(componentIdRule, componentIdItem)
	}

	logs, sub, err := _World.contract.WatchLogs(opts, "ComponentRegistered", componentIdRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(WorldComponentRegistered)
				if err := _World.contract.UnpackLog(event, "ComponentRegistered", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseComponentRegistered is a log parse operation binding the contract event 0xe065b93b78fd9ec871610269cc875e4f300f3cf0ed219355a75c09ffdc72c185.
//
// Solidity: event ComponentRegistered(uint256 indexed componentId, address component)
func (_World *WorldFilterer) ParseComponentRegistered(log types.Log) (*WorldComponentRegistered, error) {
	event := new(WorldComponentRegistered)
	if err := _World.contract.UnpackLog(event, "ComponentRegistered", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// WorldComponentValueRemovedIterator is returned from FilterComponentValueRemoved and is used to iterate over the raw logs and unpacked data for ComponentValueRemoved events raised by the World contract.
type WorldComponentValueRemovedIterator struct {
	Event *WorldComponentValueRemoved // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *WorldComponentValueRemovedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(WorldComponentValueRemoved)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(WorldComponentValueRemoved)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *WorldComponentValueRemovedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *WorldComponentValueRemovedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// WorldComponentValueRemoved represents a ComponentValueRemoved event raised by the World contract.
type WorldComponentValueRemoved struct {
	ComponentId *big.Int
	Component   common.Address
	Entity      *big.Int
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterComponentValueRemoved is a free log retrieval operation binding the contract event 0x6dd56823030ae6d8ae09cbfb8972c4e9494e67b209c4ab6300c21d73e269b350.
//
// Solidity: event ComponentValueRemoved(uint256 indexed componentId, address indexed component, uint256 indexed entity)
func (_World *WorldFilterer) FilterComponentValueRemoved(opts *bind.FilterOpts, componentId []*big.Int, component []common.Address, entity []*big.Int) (*WorldComponentValueRemovedIterator, error) {

	var componentIdRule []interface{}
	for _, componentIdItem := range componentId {
		componentIdRule = append(componentIdRule, componentIdItem)
	}
	var componentRule []interface{}
	for _, componentItem := range component {
		componentRule = append(componentRule, componentItem)
	}
	var entityRule []interface{}
	for _, entityItem := range entity {
		entityRule = append(entityRule, entityItem)
	}

	logs, sub, err := _World.contract.FilterLogs(opts, "ComponentValueRemoved", componentIdRule, componentRule, entityRule)
	if err != nil {
		return nil, err
	}
	return &WorldComponentValueRemovedIterator{contract: _World.contract, event: "ComponentValueRemoved", logs: logs, sub: sub}, nil
}

// WatchComponentValueRemoved is a free log subscription operation binding the contract event 0x6dd56823030ae6d8ae09cbfb8972c4e9494e67b209c4ab6300c21d73e269b350.
//
// Solidity: event ComponentValueRemoved(uint256 indexed componentId, address indexed component, uint256 indexed entity)
func (_World *WorldFilterer) WatchComponentValueRemoved(opts *bind.WatchOpts, sink chan<- *WorldComponentValueRemoved, componentId []*big.Int, component []common.Address, entity []*big.Int) (event.Subscription, error) {

	var componentIdRule []interface{}
	for _, componentIdItem := range componentId {
		componentIdRule = append(componentIdRule, componentIdItem)
	}
	var componentRule []interface{}
	for _, componentItem := range component {
		componentRule = append(componentRule, componentItem)
	}
	var entityRule []interface{}
	for _, entityItem := range entity {
		entityRule = append(entityRule, entityItem)
	}

	logs, sub, err := _World.contract.WatchLogs(opts, "ComponentValueRemoved", componentIdRule, componentRule, entityRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(WorldComponentValueRemoved)
				if err := _World.contract.UnpackLog(event, "ComponentValueRemoved", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseComponentValueRemoved is a log parse operation binding the contract event 0x6dd56823030ae6d8ae09cbfb8972c4e9494e67b209c4ab6300c21d73e269b350.
//
// Solidity: event ComponentValueRemoved(uint256 indexed componentId, address indexed component, uint256 indexed entity)
func (_World *WorldFilterer) ParseComponentValueRemoved(log types.Log) (*WorldComponentValueRemoved, error) {
	event := new(WorldComponentValueRemoved)
	if err := _World.contract.UnpackLog(event, "ComponentValueRemoved", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// WorldComponentValueSetIterator is returned from FilterComponentValueSet and is used to iterate over the raw logs and unpacked data for ComponentValueSet events raised by the World contract.
type WorldComponentValueSetIterator struct {
	Event *WorldComponentValueSet // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *WorldComponentValueSetIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(WorldComponentValueSet)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(WorldComponentValueSet)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *WorldComponentValueSetIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *WorldComponentValueSetIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// WorldComponentValueSet represents a ComponentValueSet event raised by the World contract.
type WorldComponentValueSet struct {
	ComponentId *big.Int
	Component   common.Address
	Entity      *big.Int
	Data        []byte
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterComponentValueSet is a free log retrieval operation binding the contract event 0x6ac31c38682e0128240cf68316d7ae751020d8f74c614e2a30278afcec8a6073.
//
// Solidity: event ComponentValueSet(uint256 indexed componentId, address indexed component, uint256 indexed entity, bytes data)
func (_World *WorldFilterer) FilterComponentValueSet(opts *bind.FilterOpts, componentId []*big.Int, component []common.Address, entity []*big.Int) (*WorldComponentValueSetIterator, error) {

	var componentIdRule []interface{}
	for _, componentIdItem := range componentId {
		componentIdRule = append(componentIdRule, componentIdItem)
	}
	var componentRule []interface{}
	for _, componentItem := range component {
		componentRule = append(componentRule, componentItem)
	}
	var entityRule []interface{}
	for _, entityItem := range entity {
		entityRule = append(entityRule, entityItem)
	}

	logs, sub, err := _World.contract.FilterLogs(opts, "ComponentValueSet", componentIdRule, componentRule, entityRule)
	if err != nil {
		return nil, err
	}
	return &WorldComponentValueSetIterator{contract: _World.contract, event: "ComponentValueSet", logs: logs, sub: sub}, nil
}

// WatchComponentValueSet is a free log subscription operation binding the contract event 0x6ac31c38682e0128240cf68316d7ae751020d8f74c614e2a30278afcec8a6073.
//
// Solidity: event ComponentValueSet(uint256 indexed componentId, address indexed component, uint256 indexed entity, bytes data)
func (_World *WorldFilterer) WatchComponentValueSet(opts *bind.WatchOpts, sink chan<- *WorldComponentValueSet, componentId []*big.Int, component []common.Address, entity []*big.Int) (event.Subscription, error) {

	var componentIdRule []interface{}
	for _, componentIdItem := range componentId {
		componentIdRule = append(componentIdRule, componentIdItem)
	}
	var componentRule []interface{}
	for _, componentItem := range component {
		componentRule = append(componentRule, componentItem)
	}
	var entityRule []interface{}
	for _, entityItem := range entity {
		entityRule = append(entityRule, entityItem)
	}

	logs, sub, err := _World.contract.WatchLogs(opts, "ComponentValueSet", componentIdRule, componentRule, entityRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(WorldComponentValueSet)
				if err := _World.contract.UnpackLog(event, "ComponentValueSet", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseComponentValueSet is a log parse operation binding the contract event 0x6ac31c38682e0128240cf68316d7ae751020d8f74c614e2a30278afcec8a6073.
//
// Solidity: event ComponentValueSet(uint256 indexed componentId, address indexed component, uint256 indexed entity, bytes data)
func (_World *WorldFilterer) ParseComponentValueSet(log types.Log) (*WorldComponentValueSet, error) {
	event := new(WorldComponentValueSet)
	if err := _World.contract.UnpackLog(event, "ComponentValueSet", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
