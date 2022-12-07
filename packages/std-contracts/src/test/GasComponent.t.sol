// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { DSTestPlus } from "solmate/test/utils/DSTestPlus.sol";
import { Vm } from "forge-std/Vm.sol";
import { console } from "forge-std/console.sol";
import { World } from "solecs/World.sol";

import { BoolComponent } from "../components/BoolComponent.sol";
import { BoolBareComponent } from "../components/BoolBareComponent.sol";
import { Uint256Component } from "../components/Uint256Component.sol";
import { Uint256BareComponent } from "../components/Uint256BareComponent.sol";
import { CoordComponent, Coord } from "../components/CoordComponent.sol";
import { CoordBareComponent, Coord as BareCoord } from "../components/CoordBareComponent.sol";

import { TestComponent, TestStruct } from "./TestComponent.sol";
import { TestBareComponent, TestStructBare } from "./TestBareComponent.sol";

contract ComponentTest is DSTestPlus {
  Vm internal immutable vm = Vm(HEVM_ADDRESS);

  address payable[] internal users;

  BoolComponent internal boolComponent;
  uint256 constant BoolID = uint256(keccak256("component.Bool"));

  BoolBareComponent internal boolBareComponent;
  uint256 constant BoolBareID = uint256(keccak256("component.BoolBare"));

  Uint256Component internal uint256Component;
  uint256 constant Uint256ID = uint256(keccak256("component.Uint256"));

  Uint256BareComponent internal uint256BareComponent;
  uint256 constant Uint256BareID = uint256(keccak256("component.Uint256Bare"));

  CoordComponent internal coordComponent;
  uint256 constant CoordID = uint256(keccak256("component.Coord"));

  CoordBareComponent internal coordBareComponent;
  uint256 constant CoordBareID = uint256(keccak256("component.CoordBare"));

  TestComponent internal testComponent;
  TestBareComponent internal testBareComponent;

  function setUp() public {
    World world = new World();
    world.init();
    boolComponent = new BoolComponent(address(world), BoolID);
    boolBareComponent = new BoolBareComponent(address(world), BoolBareID);
    uint256Component = new Uint256Component(address(world), Uint256ID);
    uint256BareComponent = new Uint256BareComponent(address(world), Uint256BareID);
    coordComponent = new CoordComponent(address(world), CoordID);
    coordBareComponent = new CoordBareComponent(address(world), CoordBareID);
    testComponent = new TestComponent(address(world));
    testBareComponent = new TestBareComponent(address(world));
  }

  function testBaseComponentGas() public {
    uint256 entity = 420;
    uint256 gas;

    // Set Corod
    Coord memory temp = Coord({ x: 1, y: 1 });
    gas = gasleft();
    coordComponent.set(entity, temp);
    console.log("Setting a Coord component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    coordComponent.set(entity, Coord({ x: 2, y: 2 }));
    console.log("Updating a Coord component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    coordComponent.remove(entity);
    console.log("Removing a Coord component used %s gas", gas - gasleft());

    // Coord Bare
    BareCoord memory bareTemp = BareCoord({ x: 3, y: 3 });
    gas = gasleft();
    coordBareComponent.set(entity, bareTemp);
    console.log("Setting a Bare Coord component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    coordBareComponent.set(entity, BareCoord({ x: 2, y: 2 }));
    console.log("Updating a Bare Coord component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    coordBareComponent.remove(entity);
    console.log("Removing a Bare Coord component used %s gas", gas - gasleft());

    // Set Uint256
    gas = gasleft();
    uint256Component.set(entity, 1);
    console.log("Setting a Uint256 component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    uint256Component.set(entity, 2);
    console.log("Updating a Uint256 component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    uint256Component.remove(entity);
    console.log("Removing a Uint256 component used %s gas", gas - gasleft());

    //  Set Bare Uint256
    gas = gasleft();
    uint256BareComponent.set(entity, 1);
    console.log("Setting a Bare Uint256 component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    uint256BareComponent.set(entity, 2);
    console.log("Updating a Bare Uint256 component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    uint256BareComponent.remove(entity);
    console.log("Removing a Bare Uint256 component used %s gas", gas - gasleft());

    // Set Bool
    gas = gasleft();
    boolComponent.set(entity);
    console.log("Setting a Bool component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    boolComponent.set(entity);
    console.log("Updating a Bool component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    boolComponent.remove(entity);
    console.log("Removing a Bool component used %s gas", gas - gasleft());

    // Set Bool Bare
    gas = gasleft();
    boolBareComponent.set(entity);
    console.log("Setting a Bool Bare component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    boolBareComponent.set(entity);
    console.log("Updating a Bool Bare component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    boolBareComponent.remove(entity);
    console.log("Removing a Bool Bare component used %s gas", gas - gasleft());
  }

  function testStructComponentGas() public {
    uint256 entity = 420;
    uint256 gas;

    TestStruct memory t = TestStruct({ a: 100, b: -20, c: address(this), d: "hello" });
    TestStruct memory t1 = TestStruct({ a: 101, b: -21, c: address(this), d: "hi" });

    gas = gasleft();
    testComponent.set(entity, t);
    console.log("Setting a Struct component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    testComponent.set(entity, t1);
    console.log("Updating a Struct component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    testComponent.remove(entity);
    console.log("Removing a Struct component used %s gas", gas - gasleft());

    // Test Bare
    TestStructBare memory tb = TestStructBare({ a: 100, b: -20, c: address(this), d: "hello" });
    TestStructBare memory tb1 = TestStructBare({ a: 101, b: -21, c: address(this), d: "hi" });

    gas = gasleft();
    testBareComponent.set(entity, tb);
    console.log("Setting a Bare Struct component used %s gas", gas - gasleft());
    // Update
    gas = gasleft();
    testBareComponent.set(entity, tb1);
    console.log("Updating a Bare Struct component used %s gas", gas - gasleft());
    // Remove
    gas = gasleft();
    testBareComponent.remove(entity);
    console.log("Removing a Bare Struct component used %s gas", gas - gasleft());
  }
}
