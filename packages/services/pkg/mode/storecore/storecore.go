// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package storecore

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

// StorecoreMetaData contains all meta data concerning the Storecore contract.
var StorecoreMetaData = &bind.MetaData{
	ABI: "[{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"bytes32\",\"name\":\"tableId\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"bytes32[]\",\"name\":\"key\",\"type\":\"bytes32[]\"}],\"name\":\"StoreDeleteRecord\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"bytes32\",\"name\":\"tableId\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"bytes32[]\",\"name\":\"key\",\"type\":\"bytes32[]\"},{\"indexed\":false,\"internalType\":\"uint8\",\"name\":\"schemaIndex\",\"type\":\"uint8\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"StoreSetField\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"bytes32\",\"name\":\"tableId\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"bytes32[]\",\"name\":\"key\",\"type\":\"bytes32[]\"},{\"indexed\":false,\"internalType\":\"bytes\",\"name\":\"data\",\"type\":\"bytes\"}],\"name\":\"StoreSetRecord\",\"type\":\"event\"}]",
}

// StorecoreABI is the input ABI used to generate the binding from.
// Deprecated: Use StorecoreMetaData.ABI instead.
var StorecoreABI = StorecoreMetaData.ABI

// Storecore is an auto generated Go binding around an Ethereum contract.
type Storecore struct {
	StorecoreCaller     // Read-only binding to the contract
	StorecoreTransactor // Write-only binding to the contract
	StorecoreFilterer   // Log filterer for contract events
}

// StorecoreCaller is an auto generated read-only Go binding around an Ethereum contract.
type StorecoreCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StorecoreTransactor is an auto generated write-only Go binding around an Ethereum contract.
type StorecoreTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StorecoreFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type StorecoreFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StorecoreSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type StorecoreSession struct {
	Contract     *Storecore        // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// StorecoreCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type StorecoreCallerSession struct {
	Contract *StorecoreCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts    // Call options to use throughout this session
}

// StorecoreTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type StorecoreTransactorSession struct {
	Contract     *StorecoreTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts    // Transaction auth options to use throughout this session
}

// StorecoreRaw is an auto generated low-level Go binding around an Ethereum contract.
type StorecoreRaw struct {
	Contract *Storecore // Generic contract binding to access the raw methods on
}

// StorecoreCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type StorecoreCallerRaw struct {
	Contract *StorecoreCaller // Generic read-only contract binding to access the raw methods on
}

// StorecoreTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type StorecoreTransactorRaw struct {
	Contract *StorecoreTransactor // Generic write-only contract binding to access the raw methods on
}

// NewStorecore creates a new instance of Storecore, bound to a specific deployed contract.
func NewStorecore(address common.Address, backend bind.ContractBackend) (*Storecore, error) {
	contract, err := bindStorecore(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Storecore{StorecoreCaller: StorecoreCaller{contract: contract}, StorecoreTransactor: StorecoreTransactor{contract: contract}, StorecoreFilterer: StorecoreFilterer{contract: contract}}, nil
}

// NewStorecoreCaller creates a new read-only instance of Storecore, bound to a specific deployed contract.
func NewStorecoreCaller(address common.Address, caller bind.ContractCaller) (*StorecoreCaller, error) {
	contract, err := bindStorecore(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &StorecoreCaller{contract: contract}, nil
}

// NewStorecoreTransactor creates a new write-only instance of Storecore, bound to a specific deployed contract.
func NewStorecoreTransactor(address common.Address, transactor bind.ContractTransactor) (*StorecoreTransactor, error) {
	contract, err := bindStorecore(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &StorecoreTransactor{contract: contract}, nil
}

// NewStorecoreFilterer creates a new log filterer instance of Storecore, bound to a specific deployed contract.
func NewStorecoreFilterer(address common.Address, filterer bind.ContractFilterer) (*StorecoreFilterer, error) {
	contract, err := bindStorecore(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &StorecoreFilterer{contract: contract}, nil
}

// bindStorecore binds a generic wrapper to an already deployed contract.
func bindStorecore(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(StorecoreABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Storecore *StorecoreRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Storecore.Contract.StorecoreCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Storecore *StorecoreRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Storecore.Contract.StorecoreTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Storecore *StorecoreRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Storecore.Contract.StorecoreTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Storecore *StorecoreCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _Storecore.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Storecore *StorecoreTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Storecore.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Storecore *StorecoreTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Storecore.Contract.contract.Transact(opts, method, params...)
}

// StorecoreStoreDeleteRecordIterator is returned from FilterStoreDeleteRecord and is used to iterate over the raw logs and unpacked data for StoreDeleteRecord events raised by the Storecore contract.
type StorecoreStoreDeleteRecordIterator struct {
	Event *StorecoreStoreDeleteRecord // Event containing the contract specifics and raw log

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
func (it *StorecoreStoreDeleteRecordIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StorecoreStoreDeleteRecord)
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
		it.Event = new(StorecoreStoreDeleteRecord)
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
func (it *StorecoreStoreDeleteRecordIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StorecoreStoreDeleteRecordIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StorecoreStoreDeleteRecord represents a StoreDeleteRecord event raised by the Storecore contract.
type StorecoreStoreDeleteRecord struct {
	TableId [32]byte
	Key     [][32]byte
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterStoreDeleteRecord is a free log retrieval operation binding the contract event 0x2cc8610b80ef19409ae51ecbdd9c137960fb22ae9ef2d817d36ec1b685d68ecd.
//
// Solidity: event StoreDeleteRecord(bytes32 tableId, bytes32[] key)
func (_Storecore *StorecoreFilterer) FilterStoreDeleteRecord(opts *bind.FilterOpts) (*StorecoreStoreDeleteRecordIterator, error) {

	logs, sub, err := _Storecore.contract.FilterLogs(opts, "StoreDeleteRecord")
	if err != nil {
		return nil, err
	}
	return &StorecoreStoreDeleteRecordIterator{contract: _Storecore.contract, event: "StoreDeleteRecord", logs: logs, sub: sub}, nil
}

// WatchStoreDeleteRecord is a free log subscription operation binding the contract event 0x2cc8610b80ef19409ae51ecbdd9c137960fb22ae9ef2d817d36ec1b685d68ecd.
//
// Solidity: event StoreDeleteRecord(bytes32 tableId, bytes32[] key)
func (_Storecore *StorecoreFilterer) WatchStoreDeleteRecord(opts *bind.WatchOpts, sink chan<- *StorecoreStoreDeleteRecord) (event.Subscription, error) {

	logs, sub, err := _Storecore.contract.WatchLogs(opts, "StoreDeleteRecord")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StorecoreStoreDeleteRecord)
				if err := _Storecore.contract.UnpackLog(event, "StoreDeleteRecord", log); err != nil {
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

// ParseStoreDeleteRecord is a log parse operation binding the contract event 0x2cc8610b80ef19409ae51ecbdd9c137960fb22ae9ef2d817d36ec1b685d68ecd.
//
// Solidity: event StoreDeleteRecord(bytes32 tableId, bytes32[] key)
func (_Storecore *StorecoreFilterer) ParseStoreDeleteRecord(log types.Log) (*StorecoreStoreDeleteRecord, error) {
	event := new(StorecoreStoreDeleteRecord)
	if err := _Storecore.contract.UnpackLog(event, "StoreDeleteRecord", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StorecoreStoreSetFieldIterator is returned from FilterStoreSetField and is used to iterate over the raw logs and unpacked data for StoreSetField events raised by the Storecore contract.
type StorecoreStoreSetFieldIterator struct {
	Event *StorecoreStoreSetField // Event containing the contract specifics and raw log

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
func (it *StorecoreStoreSetFieldIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StorecoreStoreSetField)
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
		it.Event = new(StorecoreStoreSetField)
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
func (it *StorecoreStoreSetFieldIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StorecoreStoreSetFieldIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StorecoreStoreSetField represents a StoreSetField event raised by the Storecore contract.
type StorecoreStoreSetField struct {
	TableId     [32]byte
	Key         [][32]byte
	SchemaIndex uint8
	Data        []byte
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterStoreSetField is a free log retrieval operation binding the contract event 0xd01f9f1368f831528fc9fe6442366b2b7d957fbfff3bcf7c24d9ab5fe51f8c46.
//
// Solidity: event StoreSetField(bytes32 tableId, bytes32[] key, uint8 schemaIndex, bytes data)
func (_Storecore *StorecoreFilterer) FilterStoreSetField(opts *bind.FilterOpts) (*StorecoreStoreSetFieldIterator, error) {

	logs, sub, err := _Storecore.contract.FilterLogs(opts, "StoreSetField")
	if err != nil {
		return nil, err
	}
	return &StorecoreStoreSetFieldIterator{contract: _Storecore.contract, event: "StoreSetField", logs: logs, sub: sub}, nil
}

// WatchStoreSetField is a free log subscription operation binding the contract event 0xd01f9f1368f831528fc9fe6442366b2b7d957fbfff3bcf7c24d9ab5fe51f8c46.
//
// Solidity: event StoreSetField(bytes32 tableId, bytes32[] key, uint8 schemaIndex, bytes data)
func (_Storecore *StorecoreFilterer) WatchStoreSetField(opts *bind.WatchOpts, sink chan<- *StorecoreStoreSetField) (event.Subscription, error) {

	logs, sub, err := _Storecore.contract.WatchLogs(opts, "StoreSetField")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StorecoreStoreSetField)
				if err := _Storecore.contract.UnpackLog(event, "StoreSetField", log); err != nil {
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

// ParseStoreSetField is a log parse operation binding the contract event 0xd01f9f1368f831528fc9fe6442366b2b7d957fbfff3bcf7c24d9ab5fe51f8c46.
//
// Solidity: event StoreSetField(bytes32 tableId, bytes32[] key, uint8 schemaIndex, bytes data)
func (_Storecore *StorecoreFilterer) ParseStoreSetField(log types.Log) (*StorecoreStoreSetField, error) {
	event := new(StorecoreStoreSetField)
	if err := _Storecore.contract.UnpackLog(event, "StoreSetField", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// StorecoreStoreSetRecordIterator is returned from FilterStoreSetRecord and is used to iterate over the raw logs and unpacked data for StoreSetRecord events raised by the Storecore contract.
type StorecoreStoreSetRecordIterator struct {
	Event *StorecoreStoreSetRecord // Event containing the contract specifics and raw log

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
func (it *StorecoreStoreSetRecordIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StorecoreStoreSetRecord)
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
		it.Event = new(StorecoreStoreSetRecord)
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
func (it *StorecoreStoreSetRecordIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StorecoreStoreSetRecordIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StorecoreStoreSetRecord represents a StoreSetRecord event raised by the Storecore contract.
type StorecoreStoreSetRecord struct {
	TableId [32]byte
	Key     [][32]byte
	Data    []byte
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterStoreSetRecord is a free log retrieval operation binding the contract event 0x912af873e852235aae78a1d25ae9bb28b616a67c36898c53a14fd8184504ee32.
//
// Solidity: event StoreSetRecord(bytes32 tableId, bytes32[] key, bytes data)
func (_Storecore *StorecoreFilterer) FilterStoreSetRecord(opts *bind.FilterOpts) (*StorecoreStoreSetRecordIterator, error) {

	logs, sub, err := _Storecore.contract.FilterLogs(opts, "StoreSetRecord")
	if err != nil {
		return nil, err
	}
	return &StorecoreStoreSetRecordIterator{contract: _Storecore.contract, event: "StoreSetRecord", logs: logs, sub: sub}, nil
}

// WatchStoreSetRecord is a free log subscription operation binding the contract event 0x912af873e852235aae78a1d25ae9bb28b616a67c36898c53a14fd8184504ee32.
//
// Solidity: event StoreSetRecord(bytes32 tableId, bytes32[] key, bytes data)
func (_Storecore *StorecoreFilterer) WatchStoreSetRecord(opts *bind.WatchOpts, sink chan<- *StorecoreStoreSetRecord) (event.Subscription, error) {

	logs, sub, err := _Storecore.contract.WatchLogs(opts, "StoreSetRecord")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StorecoreStoreSetRecord)
				if err := _Storecore.contract.UnpackLog(event, "StoreSetRecord", log); err != nil {
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

// ParseStoreSetRecord is a log parse operation binding the contract event 0x912af873e852235aae78a1d25ae9bb28b616a67c36898c53a14fd8184504ee32.
//
// Solidity: event StoreSetRecord(bytes32 tableId, bytes32[] key, bytes data)
func (_Storecore *StorecoreFilterer) ParseStoreSetRecord(log types.Log) (*StorecoreStoreSetRecord, error) {
	event := new(StorecoreStoreSetRecord)
	if err := _Storecore.contract.UnpackLog(event, "StoreSetRecord", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
