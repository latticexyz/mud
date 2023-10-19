// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { NamespaceOwner } from "@latticexyz/world/src/codegen/tables/NamespaceOwner.sol";
import { SystemRegistry } from "@latticexyz/world/src/codegen/tables/SystemRegistry.sol";

import { AccessControlLib } from "../../utils/AccessControlLib.sol";
import { PuppetMaster } from "../puppet/PuppetMaster.sol";
import { toTopic } from "../puppet/utils.sol";
import { Balances } from "../tokens/tables/Balances.sol";

import { IERC20Mintable } from "./IERC20Mintable.sol";

import { Allowances } from "./tables/Allowances.sol";
import { TotalSupply } from "./tables/TotalSupply.sol";
import { ERC20Metadata } from "./tables/ERC20Metadata.sol";

import { _allowancesTableId, _balancesTableId, _totalSupplyTableId, _metadataTableId } from "./utils.sol";

contract ERC20System is System, IERC20Mintable, PuppetMaster {
  using WorldResourceIdInstance for ResourceId;

  /**
   * @dev Returns the name of the token.
   */
  function name() public view virtual returns (string memory) {
    return ERC20Metadata.getName(_metadataTableId(_namespace()));
  }

  /**
   * @dev Returns the symbol of the token, usually a shorter version of the
   * name.
   */
  function symbol() public view virtual returns (string memory) {
    return ERC20Metadata.getSymbol(_metadataTableId(_namespace()));
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
    return ERC20Metadata.getDecimals(_metadataTableId(_namespace()));
  }

  /**
   * @dev Returns the value of tokens in existence.
   */
  function totalSupply() external view returns (uint256) {
    return TotalSupply.get(_totalSupplyTableId(_namespace()));
  }

  /**
   * @dev Returns the value of tokens owned by `account`.
   */
  function balanceOf(address account) external view returns (uint256) {
    return Balances.get(_balancesTableId(_namespace()), account);
  }

  /**
   * @dev Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(address owner, address spender) external view returns (uint256) {
    return Allowances.get(_allowancesTableId(_namespace()), owner, spender);
  }

  /**
   * @dev See {IERC20-transfer}.
   *
   * Requirements:
   *
   * - `to` cannot be the zero address.
   * - the caller must have a balance of at least `value`.
   */
  function transfer(address to, uint256 value) public virtual returns (bool) {
    address owner = _msgSender();
    _transfer(owner, to, value);

    return true;
  }

  /**
   * @dev See {IERC20-approve}.
   *
   * NOTE: If `value` is the maximum `uint256`, the allowance is not updated on
   * `transferFrom`. This is semantically equivalent to an infinite approval.
   *
   * Requirements:
   *
   * - `spender` cannot be the zero address.
   */
  function approve(address spender, uint256 value) public virtual returns (bool) {
    address owner = _msgSender();
    _approve(owner, spender, value);

    return true;
  }

  /**
   * @dev See {IERC20-transferFrom}.
   *
   * Emits an {Approval} event indicating the updated allowance. This is not
   * required by the EIP. See the note at the beginning of {ERC20}.
   *
   * NOTE: Does not update the allowance if the current allowance
   * is the maximum `uint256`.
   *
   * Requirements:
   *
   * - `from` and `to` cannot be the zero address.
   * - `from` must have a balance of at least `value`.
   * - the caller must have allowance for ``from``'s tokens of at least
   * `value`.
   */
  function transferFrom(address from, address to, uint256 value) public virtual returns (bool) {
    address spender = _msgSender();
    _spendAllowance(from, spender, value);
    _transfer(from, to, value);

    return true;
  }

  /**
   * @dev Creates a `value` amount of tokens and assigns them to `account`, by transferring it from address(0).
   * Relies on the `_update` mechanism
   *
   * Emits a {Transfer} event with `from` set to the zero address.
   */
  function mint(address account, uint256 value) public {
    // Require the caller to own the namespace
    _requireOwner();

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
   * NOTE: This function is not virtual, {_update} should be overridden instead
   */
  function burn(address account, uint256 value) public {
    // Require the caller to own the namespace
    _requireOwner();

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
  function _update(address from, address to, uint256 value) internal virtual {
    bytes14 namespace = _namespace();
    ResourceId totalSupplyTableId = _totalSupplyTableId(namespace);
    ResourceId balanceTableId = _balancesTableId(namespace);

    if (from == address(0)) {
      // Overflow check required: The rest of the code assumes that totalSupply never overflows
      TotalSupply.set(totalSupplyTableId, TotalSupply.get(totalSupplyTableId) + value);
    } else {
      uint256 fromBalance = Balances.get(balanceTableId, from);
      if (fromBalance < value) {
        revert ERC20InsufficientBalance(from, fromBalance, value);
      }
      unchecked {
        // Overflow not possible: value <= fromBalance <= totalSupply.
        Balances.set(balanceTableId, from, fromBalance - value);
      }
    }

    if (to == address(0)) {
      unchecked {
        // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
        TotalSupply.set(totalSupplyTableId, TotalSupply.get(totalSupplyTableId) - value);
      }
    } else {
      unchecked {
        // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
        Balances.set(balanceTableId, to, Balances.get(balanceTableId, to) + value);
      }
    }

    // Emit Transfer event on puppet
    puppet().log(Transfer.selector, toTopic(from), toTopic(to), abi.encode(value));
  }

  /**
   * @dev Sets `value` as the allowance of `spender` over the `owner`s tokens.
   *
   * Requirements:
   *
   * - `owner` cannot be the zero address.
   * - `spender` cannot be the zero address.
   */
  function _approve(address owner, address spender, uint256 value) internal virtual {
    if (owner == address(0)) {
      revert ERC20InvalidApprover(address(0));
    }
    if (spender == address(0)) {
      revert ERC20InvalidSpender(address(0));
    }
    Allowances.set(_allowancesTableId(_namespace()), owner, spender, value);

    // Emit Approval event on puppet
    puppet().log(Approval.selector, toTopic(owner), toTopic(spender), abi.encode(value));
  }

  /**
   * @dev Updates `owner` s allowance for `spender` based on spent `value`.
   *
   * Does not update the allowance value in case of infinite allowance.
   * Revert if not enough allowance is available.
   *
   * Does not emit an {Approval} event.
   */
  function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
    uint256 currentAllowance = Allowances.get(_allowancesTableId(_namespace()), owner, spender);
    if (currentAllowance != type(uint256).max) {
      if (currentAllowance < value) {
        revert ERC20InsufficientAllowance(spender, currentAllowance, value);
      }
      unchecked {
        _approve(owner, spender, currentAllowance - value);
      }
    }
  }

  function _namespace() internal view returns (bytes14 namespace) {
    ResourceId systemId = SystemRegistry.get(address(this));
    return systemId.getNamespace();
  }

  function _requireOwner() internal view {
    AccessControlLib.requireOwner(SystemRegistry.get(address(this)), _msgSender());
  }
}
