// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { IERC20Errors } from "./IERC20Errors.sol";
import { IERC20Events } from "./IERC20Events.sol";
import { Token } from "./codegen/tables/Token.sol";
import { Balances } from "./codegen/tables/Balances.sol";
import { Allowances } from "./codegen/tables/Allowances.sol";

import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { RESOURCE_TABLE } from "@latticexyz/store/src/storeResourceTypes.sol";
import { ResourceId, ResourceIdLib } from "@latticexyz/store/src/ResourceId.sol";

/**
 * @title ERC20 Module with external Store
 * @author MUD (https://mud.dev) by Lattice (https://lattice.xyz)
 * @dev Implementation of EIP-20 that has on instance of `Store` which enables built in indexing and storage packing.
 */
contract ERC20 is IERC20Errors, IERC20Events {
  ResourceId tokenTableId;
  IStore store;

  constructor(string memory _name, string memory _symbol, address _owner, address _store, uint8 _decimals) {
    StoreSwitch.setStoreAddress(_store);
    store = IStore(_store);

    bytes memory symbolAsBytes = bytes(_symbol);
    require(symbolAsBytes.length > 0 && symbolAsBytes.length <= 30, "ERC20: symbol length too long");
    bytes30 symbolAsBytes30 = bytes30(symbolAsBytes);

    tokenTableId = ResourceIdLib.encode({
      typeId: RESOURCE_TABLE, // onchain table
      name: symbolAsBytes30
    });

    Token.register(tokenTableId);
    Balances.register();
    Allowances.register();

    //IStore(_store).registerTable(tokenTableId, Token._fieldLayout, Token._keySchema, Token._valueSchema, Token.getKeyNames(), Token.getFieldNames());
    //IStore(_store).setRecord(tokenTableId, bytes32(uint256(0)), Token._keySchema, Token._valueSchema);

    Token.set(store, tokenTableId, _decimals, 0, _owner, _name, _symbol);
  }

  /**
   * @dev Returns the name of the token.
   * @return The name of the token.
   */
  function name() public view returns (string memory) {
    return Token.getName(store, tokenTableId);
  }

  /**
   * @dev Returns the symbol of the token, usually a shorter version of the
   * name.
   * @return The symbol of the token.
   */
  function symbol() public view returns (string memory) {
    return Token.getSymbol(store, tokenTableId);
  }

  /**
   * @dev Returns the decimals of the token.
   * @return The number of decimals of the token.
   */
  function decimals() public view returns (uint8) {
    return Token.getDecimals(store, tokenTableId);
  }

  /**
   * @dev Returns the total supply of the token.
   * @return The total supply of the token.
   */
  function totalSupply() public view returns (uint256) {
    return Token.getTotalSupply(store, tokenTableId);
  }

  /**
   * @dev Returns the balance of the `account`.
   * @param account The address of the account to get the balance of.
   * @return The balance of the `account`.
   */
  function balanceOf(address account) public view returns (uint256) {
    return Balances.get(address(this), account);
  }

  /**
   * @dev Returns the allowance of `spender` for `owner`.
   * @param owner The address of the owner.
   * @param spender The address of the spender.
   */
  function allowance(address owner, address spender) public view returns (uint256) {
    return Allowances.get(address(this), owner, spender);
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
  function approve(address spender, uint256 value) public returns (bool) {
    _approve(msg.sender, spender, value);
    return true;
  }

  /**
   * @dev Moves a `value` amount of tokens from the caller's account to `to`.
   *
   * Returns a boolean value indicating whether the operation succeeded.
   *
   * Emits a {Transfer} event.
   */
  function transfer(address to, uint256 value) public returns (bool) {
    _transfer(msg.sender, to, value);
    return true;
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
  function transferFrom(address from, address to, uint256 value) public returns (bool) {
    _spendAllowance(from, msg.sender, value);
    _transfer(from, to, value);
    return true;
  }

  /**
   * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
   * Relies on the `_update` mechanism
   *
   * Emits a {Transfer} event with `from` set to the zero address.
   *
   */
  function mint(address account, uint256 value) external {
    assert(Token.getOwner(tokenTableId) == msg.sender);
    if (account == address(0)) {
      revert ERC20InvalidReceiver(address(0));
    }
    _update(address(0), account, value);
  }

  /**
   * @dev Destroys a `value` amount of tokens from `account`, lowering the total supply.
   * Relies on the `_update` mechanism.
   *
   * Emits a {Transfer} event with `to` set to the zero address.
   *
   */
  function burn(address account, uint256 value) external {
    assert(Token.getOwner(tokenTableId) == msg.sender);
    if (account == address(0)) {
      revert ERC20InvalidSender(address(0));
    }
    _update(account, address(0), value);
  }

  /**
   * @dev Moves a `value` amount of tokens from `from` to `to`.
   *
   * This internal function is equivalent to {transfer}, and can be used to
   * e.g. implement automatic token fees, slashing mechanisms, etc.
   *
   * Emits a {Transfer} event.
   *
   * NOTE: This function is not virtual, {_update} should be overridden instead.
   */
  function _transfer(address from, address to, uint256 value) internal {
    if (from == address(0)) {
      revert ERC20InvalidSender(address(0));
    }
    if (to == address(0)) {
      revert ERC20InvalidReceiver(address(0));
    }
    _update(from, to, value);
  }

  /**
   * @dev Transfers a `value` amount of tokens from `from` to `to`, or alternatively mints (or burns) if `from`
   * (or `to`) is the zero address. All customizations to transfers, mints, and burns should be done by overriding
   * this function.
   *
   * Emits a {Transfer} event.
   */
  function _update(address from, address to, uint256 value) internal {
    if (from == address(0)) {
      // Overflow check required: The rest of the code assumes that totalSupply never overflows
      uint256 supplyBefore = Token.getTotalSupply(tokenTableId);
      Token.setTotalSupply(store, tokenTableId, supplyBefore + value);
    } else {
      uint256 fromBalancePrior = Balances.get(address(this), from);
      if (fromBalancePrior < value) {
        revert ERC20InsufficientBalance(from, fromBalancePrior, value);
      }
      unchecked {
        // Overflow not possible: value <= fromBalance <= totalSupply.
        Balances.setBalance(address(this), from, fromBalancePrior - value);
      }
    }

    if (to == address(0)) {
      unchecked {
        // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
        uint256 supplyBefore = Token.getTotalSupply(tokenTableId);
        Token.setTotalSupply(store, tokenTableId, supplyBefore - value);
      }
    } else {
      unchecked {
        // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
        uint256 balanceToPrior = Balances.get(address(this), to);
        Balances.setBalance(address(this), to, balanceToPrior + value);
      }
    }

    emit Transfer(from, to, value);
  }

  /**
   * @dev Sets `value` as the allowance of `spender` over the `owner`'s tokens.
   *
   * This internal function is equivalent to `approve`, and can be used to
   * e.g. set automatic allowances for certain subsystems, etc.
   *
   * Emits an {Approval} event.
   *
   * Requirements:
   *
   * - `owner` cannot be the zero address.
   * - `spender` cannot be the zero address.
   *
   */
  function _approve(address owner, address spender, uint256 value) internal {
    _approve(owner, spender, value, true);
  }

  /**
   * @dev Variant of {_approve} with an optional flag to enable or disable the {Approval} event.
   *
   * By default (when calling {_approve}) the flag is set to true. On the other hand, approval changes made by
   * `_spendAllowance` during the `transferFrom` operation set the flag to false. This saves gas by not emitting any
   * `Approval` event during `transferFrom` operations.
   *
   *
   * Requirements are the same as {_approve}.
   */
  function _approve(address owner, address spender, uint256 value, bool emitEvent) internal {
    if (owner == address(0)) {
      revert ERC20InvalidApprover(address(0));
    }
    if (spender == address(0)) {
      revert ERC20InvalidSpender(address(0));
    }
    Allowances.setApproval(address(this), owner, spender, value);
    if (emitEvent) {
      emit Approval(owner, spender, value);
    }
  }

  /**
   * @dev Updates `owner` s allowance for `spender` based on spent `value`.
   *
   * Does not update the allowance value in case of infinite allowance.
   * Revert if not enough allowance is available.
   *
   * Does not emit an {Approval} event.
   */
  function _spendAllowance(address owner, address spender, uint256 value) internal {
    uint256 currentAllowance = Allowances.get(address(this), owner, spender);
    if (currentAllowance != type(uint256).max) {
      if (currentAllowance < value) {
        revert ERC20InsufficientAllowance(spender, currentAllowance, value);
      }
      unchecked {
        _approve(owner, spender, currentAllowance - value, false);
      }
    }
  }
}
