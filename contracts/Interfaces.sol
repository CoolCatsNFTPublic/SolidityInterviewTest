// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IMilk {
    function deposit(address user, bytes calldata depositData) external;
    function withdraw(uint256 amount) external;
    function gameWithdraw(address owner, uint256 amount) external;
    function gameTransferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external;
    function gameBurn(address owner, uint256 amount) external; 
    function gameMint(address to, uint256 amount) external;
    function mint(address account, uint256 amount) external;
}
