// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {SmartAccountBase, NotAuthorized, InvalidInput} from "./lib/SmartAccountBase.sol";

/**
 * @title A smart contract account owned by a single ERC721 token
 */
contract SmartAccount is SmartAccountBase {
  uint256 public state;

  constructor() SmartAccountBase() {}


  /// @dev allows eth transfers by default
  receive() external payable virtual override {}

  /// @dev executes a low-level call against an account if the caller is authorized to make calls
  function execute(
    address to,
    uint256 value,
    bytes calldata data,
    uint8 operation
  )
    public
    payable
    virtual
    override
    onlyValidSigner
    returns (bytes memory)
  {
    require(operation == 0, "Only call operations are supported");
    ++state;

    // Execute Call on Account
    return _call(to, value, data);
  }

}
