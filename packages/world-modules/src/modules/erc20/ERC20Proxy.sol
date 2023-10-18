// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { IBaseWorld } from "@latticexyz/world/src/codegen/interfaces/IBaseWorld.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { Slice, SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

import { Allowances } from "./tables/Allowances.sol";
import { Metadata } from "./tables/Metadata.sol";
import { Balances } from "./tables/Balances.sol";

import { IERC20 } from "./IERC20.sol";
import { IERC20Mintable } from "./IERC20Mintable.sol";
import { IERC20Errors } from "./IERC20Errors.sol";
import { ERC20System } from "./ERC20System.sol";

contract ERC20Proxy is IERC20Mintable, IERC20Errors, SystemHook {
  using SliceInstance for Slice;
  error ERC20Proxy_NotAuthorized();

  IBaseWorld private immutable world;
  ResourceId public immutable erc20SystemId;
  ResourceId public immutable allowanceTableId;
  ResourceId public immutable balanceTableId;
  ResourceId public immutable metadataTableId;

  constructor(
    IBaseWorld _world,
    ResourceId _erc20SystemId,
    ResourceId _allowanceTableId,
    ResourceId _balanceTableId,
    ResourceId _metadataTableId
  ) {
    StoreSwitch.setStoreAddress(address(_world));
    world = _world;
    erc20SystemId = _erc20SystemId;
    allowanceTableId = _allowanceTableId;
    balanceTableId = _balanceTableId;
    metadataTableId = _metadataTableId;
  }

  /**
   * @dev Returns the name of the token.
   */
  function name() public view virtual returns (string memory) {
    return Metadata.getName(metadataTableId);
  }

  /**
   * @dev Returns the symbol of the token, usually a shorter version of the
   * name.
   */
  function symbol() public view virtual returns (string memory) {
    return Metadata.getSymbol(metadataTableId);
  }

  /**
   * @dev Returns the number of decimals used to get its user representation.
   * For example, if `decimals` equals `2`, a balance of `505` tokens should
   * be displayed to a user as `5.05` (`505 / 10 ** 2`).
   *
   * Tokens usually opt for a value of 18, imitating the relationship between
   * Ether and Wei. This is the default value returned by this function, unless
   * it's overridden.
   *
   * NOTE: This information is only used for _display_ purposes: it in
   * no way affects any of the arithmetic of the contract, including
   * {IERC20-balanceOf} and {IERC20-transfer}.
   */
  function decimals() public view virtual returns (uint8) {
    return Metadata.getDecimals(metadataTableId);
  }

  /**
   * @dev Returns the value of tokens in existence.
   */
  function totalSupply() external view returns (uint256) {
    return Metadata.getTotalSupply(metadataTableId);
  }

  /**
   * @dev Returns the value of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256) {
    return Balances.get(balanceTableId, account);
  }

  /**
   * @dev Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(address owner, address spender) external view returns (uint256) {
    return Allowances.get(allowanceTableId, owner, spender);
  }

  /**
   * @dev Moves a `value` amount of tokens from the caller's account to `to`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address to, uint256 value) external returns (bool) {
    return
      abi.decode(
        world.callFrom(
          msg.sender,
          erc20SystemId,
          abi.encodeCall(ERC20System.transfer, (balanceTableId, metadataTableId, to, value))
        ),
        (bool)
      );
  }

  /**
   * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
   * caller's tokens.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * IMPORTANT: Beware that changing an allowance with this method brings the risk
   * that someone may use both the old and the new allowance by unfortunate
   * transaction ordering. One possible solution to mitigate this race
   * condition is to first reduce the spender's allowance to 0 and set the
   * desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   *
   * Emits an {Approval} event.
   */
  function approve(address spender, uint256 value) external returns (bool) {
    return
      abi.decode(
        world.callFrom(
          msg.sender,
          erc20SystemId,
          abi.encodeCall(ERC20System.approve, (allowanceTableId, spender, value))
        ),
        (bool)
      );
  }

  /**
   * @dev Moves a `value` amount of tokens from `from` to `to` using the
   * allowance mechanism. `value` is then deducted from the caller's
   * allowance.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transferFrom(address from, address to, uint256 value) external returns (bool) {
    return
      abi.decode(
        world.callFrom(
          msg.sender,
          erc20SystemId,
          abi.encodeCall(ERC20System.transferFrom, (allowanceTableId, balanceTableId, metadataTableId, from, to, value))
        ),
        (bool)
      );
  }

  /**
   * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
   *
   * Emits a {Transfer} event with `from` set to the zero address.
   */
  function mint(address account, uint256 value) public {
    world.callFrom(
      msg.sender,
      erc20SystemId,
      abi.encodeCall(ERC20System.mint, (balanceTableId, metadataTableId, account, value))
    );
  }

  /**
   * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
   *
   * Emits a {Transfer} event with `to` set to the zero address.
   */
  function burn(address account, uint256 value) public {
    world.callFrom(
      msg.sender,
      erc20SystemId,
      abi.encodeCall(ERC20System.burn, (balanceTableId, metadataTableId, account, value))
    );
  }

  function onBeforeCallSystem(address, ResourceId, bytes memory) external pure override {
    revert SystemHook_NotImplemented();
  }

  /**
   * Emit events for ERC20 transfers and approvals
   */
  function onAfterCallSystem(address msgSender, ResourceId systemId, bytes calldata callData) external override {
    if (msg.sender != address(world)) revert ERC20Proxy_NotAuthorized();
    if (ResourceId.unwrap(systemId) != ResourceId.unwrap(erc20SystemId)) return;

    bytes4 functionSelector = bytes4(callData);
    bytes memory args = SliceLib.getSubslice(callData, 4).toBytes();

    // Emit Transfer event on transfer call
    if (functionSelector == IERC20.transfer.selector) {
      (address to, uint256 value) = abi.decode(args, (address, uint256));
      emit Transfer(msgSender, to, value);

      // Emit Transfer event on transferFrom call
    } else if (functionSelector == IERC20.transferFrom.selector) {
      (address from, address to, uint256 value) = abi.decode(args, (address, address, uint256));
      emit Transfer(from, to, value);

      // Emit Transfer event on mint call
    } else if (functionSelector == IERC20Mintable.mint.selector) {
      (address account, uint256 value) = abi.decode(args, (address, uint256));
      emit Transfer(address(0), account, value);

      // Emit Transfer event on burn call
    } else if (functionSelector == IERC20Mintable.burn.selector) {
      (address account, uint256 value) = abi.decode(args, (address, uint256));
      emit Transfer(account, address(0), value);

      // Emit Approval event on approve call
    } else if (functionSelector == IERC20.approve.selector) {
      (address spender, uint256 value) = abi.decode(args, (address, uint256));
      emit Approval(msgSender, spender, value);
    }
  }
}
