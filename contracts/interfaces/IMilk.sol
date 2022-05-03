// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMilk {
  function gameWithdraw(address owner, uint256 amount) external;

  function gameTransferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external;

  function gameBurn(address owner, uint256 amount) external;

  function gameMint(address to, uint256 amount) external;
}
