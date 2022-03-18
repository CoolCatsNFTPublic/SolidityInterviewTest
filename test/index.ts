import { ethers } from "hardhat";
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import chai from "chai";
import { solidity } from "ethereum-waffle";
const keccak256 = require("keccak256");
import {
  ItemFactory__factory,
  Milk__factory,
  ItemFactory,
  Milk,
} from "../typechain-types";
import hre from "hardhat";
import Web3 from "web3";

chai.use(solidity);
const { expect } = chai;

describe("Token", () => {
  let web3 = new Web3(<any>hre.network.provider);
  let itemFactory: ItemFactory;
  let milk: Milk;
  let deployer: any, addr1: any;

  beforeEach(async () => {
    [deployer, addr1] = await ethers.getSigners();
    const ItemFactory_C = new ItemFactory__factory(deployer);
    itemFactory = await ItemFactory_C.deploy(deployer.address);
    const Milk_C = new Milk__factory(deployer);
    milk = await Milk_C.deploy("Milk", "Milk", itemFactory.address);
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", () => {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async () => {
      // Expect receives a value, and wraps it in an assertion objet. These
      // objects have a lot of utility methods to assert values.

      // This test expects the owner variable stored in the contract to be equal
      // to our Signer's owner.
      expect(
        await itemFactory.hasRole(
          ethers.utils.hexZeroPad("0x00", 32),
          deployer.address
        )
      ).to.equal(true);
      expect(
        await milk.hasRole(
          ethers.utils.hexZeroPad("0x00", 32),
          deployer.address
        )
      ).to.equal(true);
      expect(
        await milk.hasRole(keccak256("CONTRACT_ROLE"), itemFactory.address)
      ).to.equal(true);
    });
  });

  describe("ItemFactory", () => {
    it("setMilkContractAddress is working with deployer", async () => {
      await itemFactory.setMilkContractAddress(milk.address);
      expect(await itemFactory._milkContractAddress()).to.equal(milk.address);
    });

    it("setRarityRolls is working with deployer", async () => {
      await itemFactory.setRarityRolls(80, 100, 120, 140, 160, 180);
      expect(await itemFactory._commonRoll()).to.equal(80);
      expect(await itemFactory._uncommonRoll()).to.equal(100);
      expect(await itemFactory._rareRoll()).to.equal(120);
      expect(await itemFactory._epicRoll()).to.equal(140);
      expect(await itemFactory._legendaryRoll()).to.equal(160);
      expect(await itemFactory._maxRarityRoll()).to.equal(180);
    });

    it("setRarityRolls should work with restriction", async () => {
      await expect(
        itemFactory.setRarityRolls(110, 100, 120, 140, 160, 180)
      ).to.be.revertedWith("Common must be less rare than uncommon");
      await expect(
        itemFactory.setRarityRolls(80, 130, 120, 140, 160, 180)
      ).to.be.revertedWith("Uncommon must be less rare than rare");
      await expect(
        itemFactory.setRarityRolls(80, 100, 150, 140, 160, 180)
      ).to.be.revertedWith("Rare must be less rare than epic");
      await expect(
        itemFactory.setRarityRolls(80, 100, 120, 170, 160, 180)
      ).to.be.revertedWith("Epic must be less rare than legendary");
      await expect(
        itemFactory.setRarityRolls(80, 100, 120, 140, 190, 180)
      ).to.be.revertedWith(
        "Legendary rarity level must be less than or equal to the max rarity roll"
      );
    });

    it("setReward is working with deployer", async () => {
      //  NOTE : keccak256 does not give accurate result for combination of
      //         two or more parameters use web3.utils.soliditySha3 instead
      let reward = web3.eth.abi.encodeParameters(
        ["uint256", "uint256", "uint256[]"],
        [20, 80, [2, 3, 4]]
      );
      await itemFactory.setReward(0, 0, reward);
      expect(await itemFactory._rewardMapping(0, 0)).to.equal(reward);
    });

    describe("test claim function", () => {
      beforeEach(async () => {
        await itemFactory.setMilkContractAddress(milk.address);
        await itemFactory.setRarityRolls(80, 100, 120, 140, 160, 180);
        let reward0 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [20, 80, [2, 3, 4]]
        );
        let reward1 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [120, 180, [3, 4, 5]]
        );
        let reward2 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [120, 280, [4, 5, 6]]
        );
        let reward3 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [220, 380, [5, 6, 7]]
        );
        let reward4 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [120, 380, [7, 8, 9]]
        );
        let reward5 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [20, 480, [3, 7, 9]]
        );
        let reward6 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [220, 580, [4, 6, 8]]
        );
        let reward7 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [120, 680, [10, 17, 24]]
        );
        let reward8 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [220, 880, [11, 22, 44]]
        );
        let reward9 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [20, 980, [24, 36, 48]]
        );

        await itemFactory.setReward(0, 0, reward0);
        await itemFactory.setReward(0, 1, reward1);
        await itemFactory.setReward(0, 2, reward2);
        await itemFactory.setReward(0, 3, reward3);
        await itemFactory.setReward(0, 4, reward4);
        await itemFactory.setReward(1, 0, reward5);
        await itemFactory.setReward(2, 1, reward6);
        await itemFactory.setReward(3, 2, reward7);
        await itemFactory.setReward(4, 3, reward8);
        await itemFactory.setReward(5, 4, reward9);
      });

      it("claim function should work", async () => {
        await itemFactory.claim(deployer.address, 1111);
      });

      it("claim function can not be called twice a day", async () => {
        await itemFactory.claim(deployer.address, 1111);
        await expect(
          itemFactory.claim(deployer.address, 1111)
        ).to.be.revertedWith("Claim once per day");
      });

      it("claim function can be called after a day", async () => {
        await itemFactory.claim(deployer.address, 1111);
        await expect(
          itemFactory.claim(deployer.address, 1111)
        ).to.be.revertedWith("Claim once per day");
      });
    });

    // it("setReward should work with restriction", async () => {
    //   let reward = web3.eth.abi.encodeParameters(
    //     ["uint256", "uint256[]"],
    //     [20, [2, 3, 4]]
    //   );
    //   await itemFactory.setReward(0, 0, reward);
    //   await expect(itemFactory._rewardMapping(0, 0)).to.be.reverted;
    // });

    it("setMilkContractAddress, setRarityRolls, setReward are reverted with non deployer", async () => {
      await expect(
        itemFactory.connect(addr1).setMilkContractAddress(milk.address)
      ).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${ethers.utils.hexZeroPad(
          "0x00",
          32
        )}`
      );

      await expect(
        itemFactory.connect(addr1).setRarityRolls(80, 100, 120, 140, 160, 180)
      ).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${ethers.utils.hexZeroPad(
          "0x00",
          32
        )}`
      );

      let reward = web3.eth.abi.encodeParameters(
        ["uint256", "uint256", "uint256[]"],
        [20, 80, [2, 3, 4]]
      );
      await expect(
        itemFactory.connect(addr1).setReward(0, 0, reward)
      ).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${ethers.utils.hexZeroPad(
          "0x00",
          32
        )}`
      );
    });
  });
});
