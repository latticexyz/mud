// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* Modified by Ludens on the 5th of April 2022
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/

import { LibDiamond, DiamondStorage } from "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IERC165 } from "@openzeppelin/contracts/interfaces/IERC165.sol";

contract DiamondLoupeFacet is IDiamondLoupe, IERC165 {
  // Diamond Loupe Functions
  ////////////////////////////////////////////////////////////////////
  /// These functions are expected to be called frequently by tools.
  //
  // struct Facet {
  //     address facetAddress;
  //     bytes4[] functionSelectors;
  // }
  /// @notice Gets all facets and their selectors.
  /// @return facets_ Facet
  function facets() external view override returns (Facet[] memory facets_) {
    DiamondStorage storage ds = LibDiamond.diamondStorage();
    facets_ = new Facet[](ds.selectorCount);
    uint8[] memory numFacetSelectors = new uint8[](ds.selectorCount);
    uint256 numFacets;
    uint256 selectorIndex;
    // loop through function selectors
    for (uint256 slotIndex; selectorIndex < ds.selectorCount; slotIndex++) {
      bytes32 slot = ds.selectorSlots[slotIndex];
      for (uint256 selectorSlotIndex; selectorSlotIndex < 8; selectorSlotIndex++) {
        selectorIndex++;
        if (selectorIndex > ds.selectorCount) {
          break;
        }
        bytes4 selector = bytes4(slot << (selectorSlotIndex << 5));
        address facetAddress_ = address(bytes20(ds.facets[selector]));
        bool continueLoop;
        for (uint256 facetIndex; facetIndex < numFacets; facetIndex++) {
          if (facets_[facetIndex].facetAddress == facetAddress_) {
            facets_[facetIndex].functionSelectors[numFacetSelectors[facetIndex]] = selector;
            // probably will never have more than 256 functions from one facet contract
            require(numFacetSelectors[facetIndex] < 255);
            numFacetSelectors[facetIndex]++;
            continueLoop = true;
            break;
          }
        }
        if (continueLoop) {
          continue;
        }
        facets_[numFacets].facetAddress = facetAddress_;
        facets_[numFacets].functionSelectors = new bytes4[](ds.selectorCount);
        facets_[numFacets].functionSelectors[0] = selector;
        numFacetSelectors[numFacets] = 1;
        numFacets++;
      }
    }
    for (uint256 facetIndex; facetIndex < numFacets; facetIndex++) {
      uint256 numSelectors = numFacetSelectors[facetIndex];
      bytes4[] memory selectors = facets_[facetIndex].functionSelectors;
      // setting the number of selectors
      assembly {
        mstore(selectors, numSelectors)
      }
    }
    // setting the number of facets
    assembly {
      mstore(facets_, numFacets)
    }
  }

  /// @notice Gets all the function selectors supported by a specific facet.
  /// @param _facet The facet address.
  /// @return _facetFunctionSelectors The selectors associated with a facet address.
  function facetFunctionSelectors(address _facet)
    external
    view
    override
    returns (bytes4[] memory _facetFunctionSelectors)
  {
    DiamondStorage storage ds = LibDiamond.diamondStorage();
    uint256 numSelectors;
    _facetFunctionSelectors = new bytes4[](ds.selectorCount);
    uint256 selectorIndex;
    // loop through function selectors
    for (uint256 slotIndex; selectorIndex < ds.selectorCount; slotIndex++) {
      bytes32 slot = ds.selectorSlots[slotIndex];
      for (uint256 selectorSlotIndex; selectorSlotIndex < 8; selectorSlotIndex++) {
        selectorIndex++;
        if (selectorIndex > ds.selectorCount) {
          break;
        }
        bytes4 selector = bytes4(slot << (selectorSlotIndex << 5));
        address facet = address(bytes20(ds.facets[selector]));
        if (_facet == facet) {
          _facetFunctionSelectors[numSelectors] = selector;
          numSelectors++;
        }
      }
    }
    // Set the number of selectors in the array
    assembly {
      mstore(_facetFunctionSelectors, numSelectors)
    }
  }

  /// @notice Get all the facet addresses used by a diamond.
  /// @return facetAddresses_
  function facetAddresses() external view override returns (address[] memory facetAddresses_) {
    DiamondStorage storage ds = LibDiamond.diamondStorage();
    facetAddresses_ = new address[](ds.selectorCount);
    uint256 numFacets;
    uint256 selectorIndex;
    // loop through function selectors
    for (uint256 slotIndex; selectorIndex < ds.selectorCount; slotIndex++) {
      bytes32 slot = ds.selectorSlots[slotIndex];
      for (uint256 selectorSlotIndex; selectorSlotIndex < 8; selectorSlotIndex++) {
        selectorIndex++;
        if (selectorIndex > ds.selectorCount) {
          break;
        }
        bytes4 selector = bytes4(slot << (selectorSlotIndex << 5));
        address facetAddress_ = address(bytes20(ds.facets[selector]));
        bool continueLoop;
        for (uint256 facetIndex; facetIndex < numFacets; facetIndex++) {
          if (facetAddress_ == facetAddresses_[facetIndex]) {
            continueLoop = true;
            break;
          }
        }
        if (continueLoop) {
          continue;
        }
        facetAddresses_[numFacets] = facetAddress_;
        numFacets++;
      }
    }
    // Set the number of facet addresses in the array
    assembly {
      mstore(facetAddresses_, numFacets)
    }
  }

  /// @notice Gets the facet that supports the given selector.
  /// @dev If facet is not found return address(0).
  /// @param _functionSelector The function selector.
  /// @return facetAddress_ The facet address.
  function facetAddress(bytes4 _functionSelector) external view override returns (address facetAddress_) {
    DiamondStorage storage ds = LibDiamond.diamondStorage();
    facetAddress_ = address(bytes20(ds.facets[_functionSelector]));
  }

  // This implements ERC-165.
  function supportsInterface(bytes4 _interfaceId) external view override returns (bool) {
    DiamondStorage storage ds = LibDiamond.diamondStorage();
    return ds.supportedInterfaces[_interfaceId];
  }
}
