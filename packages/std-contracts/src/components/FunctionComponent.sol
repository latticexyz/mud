// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "solecs/Component.sol";

struct FunctionSelector {
  address contr;
  bytes4 func;
}

contract FunctionComponent is Component {
  constructor(address world, uint256 id) Component(world, id) {}

  function getSchema() public pure override returns (string[] memory keys, LibTypes.SchemaValue[] memory values) {
    keys = new string[](2);
    values = new LibTypes.SchemaValue[](2);

    keys[0] = "contr";
    values[0] = LibTypes.SchemaValue.ADDRESS;

    keys[1] = "func";
    values[1] = LibTypes.SchemaValue.BYTES4;
  }

  function set(uint256 entity, FunctionSelector memory value) public virtual {
    set(entity, abi.encode(value));
  }

  function getValue(uint256 entity) public view virtual returns (FunctionSelector memory) {
    return abi.decode(getRawValue(entity), (FunctionSelector));
  }

  function getEntitiesWithValue(FunctionSelector memory value) public view virtual returns (uint256[] memory) {
    return getEntitiesWithValue(abi.encode(value));
  }
}

function staticcallFunctionSelector(
  FunctionSelector memory functionSelector,
  bytes memory args
) view returns (bool, bytes memory) {
  return functionSelector.contr.staticcall(bytes.concat(functionSelector.func, args));
}
