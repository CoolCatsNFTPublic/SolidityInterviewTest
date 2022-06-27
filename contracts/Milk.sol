// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract Milk is ERC20, AccessControl {

    bytes32 public constant DEPOSITOR_ROLE = keccak256("DEPOSITOR_ROLE");
        bytes32 public constant CONTRACT_ROLE = keccak256("CONTRACT_ROLE");
     bytes32 public constant MASTER_ROLE = keccak256("MASTER_ROLE");

    constructor(
        string memory name,
        string memory symbol,
        address systemCheckerContractAddress
    ) ERC20(name, symbol){
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    /// @notice called when token is deposited on root chain
    /// @dev Should be callable only by ChildChainManager
    /// Should handle deposit by minting the required amount for user
    /// Make sure minting is done only by this function
    /// @param user user address for whom deposit is being done
    /// @param depositData abi encoded amount
    function deposit(address user, bytes calldata depositData) external onlyRole(DEPOSITOR_ROLE) {
        uint256 amount = abi.decode(depositData, (uint256));
        _mint(user, amount);
    }

    /// @notice called when user wants to withdraw tokens back to root chain
    /// @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
    /// @dev external with no role to allow users requesting withdraw of token when not part of game
    /// @dev _burn() handles quantity check
    /// @param amount amount of tokens to withdraw
    function withdraw(uint256 amount) external {
        _burn(_msgSender(), amount);
    }


    /* TREASURY ROLES **/
    // Special role specifically for the treasury. This allows us to create a special relationship between
    // the treasury and Milk contract. Never know when you might need it :)

    /// @notice called when user wants to withdraw tokens back to root chain
    /// @dev Should burn user's tokens. This transaction will be verified when exiting on root chain
    /// @dev User requests withdrawal and game system handles it so we have to stipulate the users address
    /// @dev Strictly speaking a logged in user has given us permission to do this, but its polite to ask :)
    /// @dev _burn() handles quantity check
    /// @param owner address of user withdrawing tokens
    /// @param amount amount of tokens to withdraw
    function gameWithdraw(address owner, uint256 amount) external onlyRole(CONTRACT_ROLE) {
        _burn(owner, amount);
    }

    /// @notice Allow the system to manage Milk within itself
    /// @dev _transfer() handles amount check
    /// @param sender Address to transfer from
    /// @param recipient Address to transfer to
    /// @param amount Amount of Gold to send - wei
    function gameTransferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external onlyRole(DEPOSITOR_ROLE) {
        _transfer(sender, recipient, amount);
    }

    /// @notice Allows system to burn tokens
    /// @dev _burn handles the amount checking
    /// @dev to prevent double milking :p we have to transfer token before burning it
    /// @dev Due to the way PoS bridge works we have to use a _burnHolderAddress that we control
    /// @dev on the Ethereum side. Contract will work but wallet is more versatile.
    /// @param owner Holder address to burn tokens of
    /// @param amount Amount of tokens to burn
    function gameBurn(address owner, uint256 amount) external onlyRole(CONTRACT_ROLE) {
        _transfer(owner, address(this), amount);
        _burn(address(this), amount);
    }

    /// @notice Mint a user some gold
    /// @dev Only activate users should ever be minted Gold
    /// @dev Reserved for game generation of Gold via quests/battles/etc...
    /// @param to Address to mint to
    /// @param amount Amount of Gold to send - wei
    function gameMint(address to, uint256 amount) external onlyRole(CONTRACT_ROLE) {
        _mint(to, amount);
    }


    /* MASTER ROLES **/
    // For ease of use and security we separate CONTRACT_ROLE from MASTER_ROLES

    /// @notice Mint that MILK
    /// @dev Designed for minting of initial token allocations
    /// @param account user for whom tokens are being minted
    /// @param amount amount of token to mint in wei
    function mint(address account, uint256 amount) public onlyRole(MASTER_ROLE) {
        _mint(account, amount);
    }
}
