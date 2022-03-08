// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./common/ERC1155SupplyCC.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ItemFactory is ERC1155SupplyCC, AccessControl {

    /// @dev Track last time a claim was made for a specific pet
    mapping(uint256 => uint256) public _lastUpdate;

    address public _milkContractAddress;

    /// @dev Rarity rolls
    uint16 public _commonRoll = 60;
    uint16 public _uncommonRoll = 80;
    uint16 public _rareRoll = 90;
    uint16 public _epicRoll = 98;
    uint16 public _legendaryRoll = 100;

    enum ERarity {
        COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
    }

    /// @dev rewardType => (rewardRarity => data)
    mapping(uint256 => mapping(uint256 => bytes)) _rewardMapping;

    constructor(string memory uri, address milkContractAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _milkContractAddress = milkContractAddress;
    }

    function claim(address claimer, uint256 entropy) external {

        // generate a single random number and bit shift as needed
        uint256 randomNum = randomNum(entropy);

        // roll and pick the rarity level of the reward
        uint256 randRarity = randomNum % _legendaryRoll;
        uint256 rewardRarity;
        bytes memory rewardData;
        uint256 rewardType = uint256(EType.BOX);

        // pick rarity based on rarity chances
        if (randRarity < _commonRoll) {
            rewardRarity = uint256(ERarity.COMMON);
        } else if (randRarity < _uncommonRoll) {
            rewardRarity = uint256(ERarity.UNCOMMON);
        } else if (randRarity < _rareRoll) {
            rewardRarity = uint256(ERarity.RARE);
        } else if (randRarity < _epicRoll) {
            rewardRarity = uint256(ERarity.EPIC);
        } else {
            rewardRarity = uint256(ERarity.LEGENDARY);
        }

        // handle Legendary on its own
        // always a box
        if (rewardRarity == uint256(ERarity.LEGENDARY)) {
            // give the user a box
            _mint(claimer, 1, 1, "");
        }

        // handle MILK or ITEMS
        else {
            // This will pick a random number between 0 and 1 inc.
            // MILK or ITEMS.
            rewardType = randomNum(entropy) % uint256(EType.BOX);

            // convert the reward mapping data to min and max
            (uint256 min, uint256 max, uint256[] memory ids) = abi.decode(
                _rewardMapping[rewardType][rewardRarity], (uint256, uint256, uint256[])
            );

            // do some bit shifting magic to create random min max
            uint256 rewardAmount = lootData.min + (randomNum(entropy)) % (lootData.max - lootData.min + 1);

            // Give a MILK reward
            if (rewardType == uint256(EType.MILK)) {
                Milk milk = Milk(_milkContractAddress);
                milk.gameMint(claimer, rewardAmount);
                rewardData = abi.encode(rewardAmount);
            }

            // Give an item reward
            else {
                uint256 index = (randomNum(entropy)) % lootData.ids.length;
                _mint(claimer, lootData.ids[index], rewardAmount, "");
                rewardData = abi.encode(lootData.ids[index], rewardAmount);
            }
        }

        emit LogDailyClaim(claimer, rewardType, rewardRarity, rewardData);

        // Claims are specific to the that pet, not the claimer or a combination of claimer and pet
        _lastUpdate[petTokenId] = block.timestamp;
    }

    function randomNum(uint entropy) internal returns (uint256) {
        return uint256(keccak256(abi.encode(block.timestamp, block.difficulty, entropy)));
    }


    /** SETTERS */

    /// @notice returns the rarity level set for each rarity, and the maximum roll
    /// @param common - rarity level of common quests
    /// @param uncommon - rarity level of uncommon quests
    /// @param rare - rarity level of rare quests
    /// @param epic - rarity level of epic quests
    /// @param legendary - rarity level of legendary quests
    /// @param maxRoll - max rarity level
    function setRarityRolls(
        uint16 common,
        uint16 uncommon,
        uint16 rare,
        uint16 epic,
        uint16 legendary,
        uint16 maxRoll
    ) external onlyRole(ADMIN_ROLE) {
        require(common < uncommon, "Common must be less rare than uncommon");
        require(uncommon < rare, "Uncommon must be less rare than rare");
        require(rare < epic, "Rare must be less rare than epic");
        require(epic < legendary, "Epic must be less rare than legendary");
        require(legendary <= maxRoll, "Legendary rarity level must be less than or equal to the max rarity roll");

        _commonRoll = common;
        _uncommonRoll = uncommon;
        _rareRoll = rare;
        _epicRoll = epic;
        _legendaryRoll = legendary;
        _maxRarityRoll = maxRoll;
    }

    function setReward(uint256 rewardType, uint256 rewardRarity, bytes calldata rewardData) external onlyRole(ADMIN_ROLE) {
        (uint256 min, uint256 max, uint256[] memory ids) = abi.decode(
            rewardData, (uint256, uint256, uint256[])
        );
        _rewardMapping[rewardType][rewardRarity] = rewardData;
    }
}
