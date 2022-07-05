// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* Modified by Ludens on the 5th of April 2022
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Implementation of a diamond.
/******************************************************************************/

import { IERC165 } from "@openzeppelin/contracts/interfaces/IERC165.sol";
import { LibDiamond, DiamondStorage } from "./libraries/LibDiamond.sol";
import { IDiamondCut } from "./interfaces/IDiamondCut.sol";
import { IDiamondLoupe } from "./interfaces/IDiamondLoupe.sol";
import { IERC173 } from "./interfaces/IERC173.sol";
import { console } from "forge-std/console.sol";

// This is only used during forge deployments in tests
// In development we currently use the hardhat hardcoded
// Diamond contract.
// If you notice weird inconsistencies between tests and dev
// chain, this is why.
contract Diamond {
  constructor(address _diamondOwner, IDiamondCut.FacetCut[] memory _diamondCut) payable {
    LibDiamond.diamondCut(_diamondCut, address(0), new bytes(0));
    LibDiamond.setContractOwner(_diamondOwner);

    DiamondStorage storage ds = LibDiamond.diamondStorage();
    // register default supported interfaces. other interfaces need to be registered in their respective facets
    ds.supportedInterfaces[type(IERC165).interfaceId] = true;
    ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
    ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
    ds.supportedInterfaces[type(IERC173).interfaceId] = true;
    // register address of diamond
    ds.diamond = address(this);
  }

  // Find facet for function that is called and execute the
  // function if a facet is found and return any value.
  fallback() external payable {
    console.log("Diamond call");
    DiamondStorage storage ds;
    bytes32 position = LibDiamond.DIAMOND_STORAGE_POSITION;
    // get diamond storage
    assembly {
      ds.slot := position
    }
    // get facet from function selector
    address facet = address(bytes20(ds.facets[msg.sig]));
    require(facet != address(0), "Diamond: Function does not exist");
    console.log("actually found the function");
    // Execute external function from facet using delegatecall and return any value.
    assembly {
      // copy function selector and any arguments
      calldatacopy(0, 0, calldatasize())
      // execute function call using the facet
      let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
      // get any return value
      returndatacopy(0, 0, returndatasize())
      // return any return value or error back to the caller
      switch result
      case 0 {
        revert(0, returndatasize())
      }
      default {
        return(0, returndatasize())
      }
    }
  }

  receive() external payable {}
}
