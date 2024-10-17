// SPDX-License-Identifier: MIT
// Adapted from OpenZeppelin Contracts (token/ERC20/ERC20.sol)
pragma solidity >=0.8.24;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { ERC20Metadata, ERC20MetadataData } from "./codegen/tables/ERC20Metadata.sol";
import { TotalSupply } from "./codegen/tables/TotalSupply.sol";
import { Balances } from "./codegen/tables/Balances.sol";
import { Allowances } from "./codegen/tables/Allowances.sol";

import { IERC20 } from "./interfaces/IERC20.sol";
import { IERC20Metadata } from "./interfaces/IERC20Metadata.sol";
import { IERC20Errors } from "./interfaces/IERC20Errors.sol";

import { Context } from "./Context.sol";
import { StoreConsumer } from "./StoreConsumer.sol";

import { ERC20TableNames } from "./Constants.sol";

abstract contract MUDERC20 is Context, IERC20, IERC20Metadata, IERC20Errors, StoreConsumer {
  ResourceId immutable TOTAL_SUPPLY_ID;
  ResourceId immutable BALANCES_ID;
  ResourceId immutable ALLOWANCES_ID;
  ResourceId immutable METADATA_ID;

  constructor(string memory _name, string memory _symbol) {
    // Needs to be inlined in the constructor
    TOTAL_SUPPLY_ID = _encodeTableId(ERC20TableNames.TOTAL_SUPPLY);
    BALANCES_ID = _encodeTableId(ERC20TableNames.BALANCES);
    ALLOWANCES_ID = _encodeTableId(ERC20TableNames.ALLOWANCES);
    METADATA_ID = _encodeTableId(ERC20TableNames.METADATA);

    // Register each table
    TotalSupply.register(TOTAL_SUPPLY_ID);
    Balances.register(BALANCES_ID);
    Allowances.register(ALLOWANCES_ID);
    ERC20Metadata.register(METADATA_ID);

    _setMetadata(_name, _symbol, 18);
  }

  /**
   * @dev Returns the name of the token.
   */
  function name() public view virtual returns (string memory) {
    return _getName();
  }

  /**
   * @dev Returns the symbol of the token, usually a shorter version of the
   * name.
   */
  function symbol() public view virtual returns (string memory) {
    return _getSymbol();
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
    return _getDecimals();
  }

  /**
   * @dev Returns the value of tokens in existence.
   */
  function totalSupply() public view returns (uint256) {
    return _getTotalSupply();
  }

  /**
   * @dev Returns the value of tokens owned by `account`.
   */
  function balanceOf(address account) public view returns (uint256) {
    return _getBalance(account);
  }

  /**
   * @dev Returns the remaining number of tokens that `spender` will be
   * allowed to spend on behalf of `owner` through {transferFrom}. This is
   * zero by default.
   *
   * This value changes when {approve} or {transferFrom} are called.
   */
  function allowance(address owner, address spender) public view returns (uint256) {
    return _getAllowance(owner, spender);
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
    _approve(owner, spender, value, true);

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
  function _mint(address account, uint256 value) internal {
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
  function _burn(address account, uint256 value) internal {
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
    if (from == address(0)) {
      // Overflow check required: The rest of the code assumes that totalSupply never overflows
      _setTotalSupply(_getTotalSupply() + value);
    } else {
      uint256 fromBalance = _getBalance(from);
      if (fromBalance < value) {
        revert ERC20InsufficientBalance(from, fromBalance, value);
      }
      unchecked {
        // Overflow not possible: value <= fromBalance <= totalSupply.
        _setBalance(from, fromBalance - value);
      }
    }

    if (to == address(0)) {
      unchecked {
        // Overflow not possible: value <= totalSupply or value <= fromBalance <= totalSupply.
        _setTotalSupply(_getTotalSupply() - value);
      }
    } else {
      unchecked {
        // Overflow not possible: balance + value is at most totalSupply, which we know fits into a uint256.
        _setBalance(to, _getBalance(to) + value);
      }
    }

    emit Transfer(from, to, value);
  }

  /**
   * @dev Sets `value` as the allowance of `spender` over the `owner`s tokens.
   *
   * Requirements:
   *
   * - `owner` cannot be the zero address.
   * - `spender` cannot be the zero address.
   */
  function _approve(address owner, address spender, uint256 value, bool emitEvent) internal virtual {
    if (owner == address(0)) {
      revert ERC20InvalidApprover(address(0));
    }
    if (spender == address(0)) {
      revert ERC20InvalidSpender(address(0));
    }

    _setAllowance(owner, spender, value);

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
  function _spendAllowance(address owner, address spender, uint256 value) internal virtual {
    uint256 currentAllowance = _getAllowance(owner, spender);
    if (currentAllowance != type(uint256).max) {
      if (currentAllowance < value) {
        revert ERC20InsufficientAllowance(spender, currentAllowance, value);
      }
      unchecked {
        _approve(owner, spender, currentAllowance - value, false);
      }
    }
  }

  function _getName() internal view returns (string memory) {
    return ERC20Metadata.getName(METADATA_ID);
  }

  function _getSymbol() internal view returns (string memory) {
    return ERC20Metadata.getSymbol(METADATA_ID);
  }

  function _getDecimals() internal view returns (uint8) {
    return ERC20Metadata.getDecimals(METADATA_ID);
  }

  function _getTotalSupply() internal view returns (uint256) {
    return TotalSupply.get(TOTAL_SUPPLY_ID);
  }

  function _getBalance(address account) internal view returns (uint256) {
    return Balances.get(BALANCES_ID, account);
  }

  function _getAllowance(address owner, address spender) internal view returns (uint256) {
    return Allowances.get(ALLOWANCES_ID, owner, spender);
  }

  function _setTotalSupply(uint256 value) internal virtual {
    TotalSupply.set(TOTAL_SUPPLY_ID, value);
  }

  function _setBalance(address account, uint256 value) internal virtual {
    Balances.set(BALANCES_ID, account, value);
  }

  function _setAllowance(address owner, address spender, uint256 value) internal virtual {
    Allowances.set(ALLOWANCES_ID, owner, spender, value);
  }

  function _setMetadata(string memory _name, string memory _symbol, uint8 _decimals) internal virtual {
    ERC20MetadataData memory metadata = ERC20MetadataData(_decimals, _name, _symbol);
    ERC20Metadata.set(METADATA_ID, metadata);
  }
}
