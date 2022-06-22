// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Interfaces.sol";

contract MockTestContract {
    IMilk milk;

    constructor(address _milk) {
        milk = IMilk(_milk);
    }

    function gameWithdraw(address owner, uint256 amount) external {
        milk.gameWithdraw(owner, amount);
    }

    function gameTransferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external {
        milk.gameTransferFrom(sender, recipient, amount);
    }

    function gameBurn(address owner, uint256 amount) external {
        milk.gameBurn(owner, amount);
    }

    function gameMint(address to, uint256 amount) external {
        milk.gameMint(to, amount);
    }
}