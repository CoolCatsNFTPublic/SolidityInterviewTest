import { ethers } from "hardhat";
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
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(solidity);
const { expect } = chai;

describe("Token", () => {
  let web3 = new Web3(<any>hre.network.provider);
  let itemFactory: ItemFactory;
  let milk: Milk;
  let deployer: SignerWithAddress, addr1: SignerWithAddress;
  let DEPOSITOR_ROLE: string,
    CONTRACT_ROLE: string,
    MASTER_ROLE: string,
    DEFAULT_ADMIN_ROLE = ethers.utils.hexZeroPad("0x00", 32);

  beforeEach(async () => {
    [deployer, addr1] = await ethers.getSigners();
    const ItemFactory_C = new ItemFactory__factory(deployer);
    itemFactory = await ItemFactory_C.deploy(deployer.address);
    const Milk_C = new Milk__factory(deployer);
    milk = await Milk_C.deploy("Milk", "Milk", itemFactory.address);
    DEPOSITOR_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("DEPOSITOR_ROLE")
    );
    CONTRACT_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("CONTRACT_ROLE")
    );
    MASTER_ROLE = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("MASTER_ROLE")
    );
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
        await itemFactory.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)
      ).to.equal(true);
      expect(await milk.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.equal(
        true
      );
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
      //         also can use ethers.utils.defaultAbiCoder
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
          [2, 4, [3, 7, 9]]
        );
        let reward6 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [2, 5, [4, 6, 8]]
        );
        let reward7 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [3, 6, [10, 17, 24]]
        );
        let reward8 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [1, 7, [11, 22, 44]]
        );
        let reward9 = web3.eth.abi.encodeParameters(
          ["uint256", "uint256", "uint256[]"],
          [2, 9, [24, 36, 48]]
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
        let tx = await itemFactory.claim(deployer.address, 1114);
        expect(tx).to.emit(itemFactory, "LogDailyClaim");
        const receipt = await ethers.provider.getTransactionReceipt(tx.hash);
        const data = receipt.logs[1].data;
        const topics = receipt.logs[1].topics;
        const interf = new ethers.utils.Interface([
          "event LogDailyClaim(address claimer, uint256 rewardType, uint256 rewardRarity, bytes rewardData)",
        ]);
        const event = interf.decodeEventLog("LogDailyClaim", data, topics);
        expect(event[0]).to.be.equal(deployer.address);
        // console.log(event[1], event[2]);
        if (event[1] == 0) {
          let amount = web3.eth.abi.decodeParameters(["uint256"], event[3]);
          // console.log(amount);
          expect(await milk.balanceOf(deployer.address)).to.be.equal(
            amount["0"]
          );
        } else {
          let amount = web3.eth.abi.decodeParameters(
            ["uint256", "uint256"],
            event[3]
          );
          // console.log(amount);
          expect(await itemFactory.totalSupply(amount["0"])).to.be.equal(
            amount["1"]
          );
        }
      });
      it("claim function can not be called twice a day", async () => {
        await itemFactory.claim(deployer.address, 1111);
        await expect(
          itemFactory.claim(deployer.address, 1111)
        ).to.be.revertedWith("Claim once per day");
      });

      it("claim function can be called after a day", async () => {
        await itemFactory.claim(deployer.address, 1111);
        // Time manipulation
        await ethers.provider.send("evm_increaseTime", [86400]);
        await ethers.provider.send("evm_mine", []);
        await itemFactory.claim(deployer.address, 1111);
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
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );

      await expect(
        itemFactory.connect(addr1).setRarityRolls(80, 100, 120, 140, 160, 180)
      ).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );

      let reward = web3.eth.abi.encodeParameters(
        ["uint256", "uint256", "uint256[]"],
        [20, 80, [2, 3, 4]]
      );
      await expect(
        itemFactory.connect(addr1).setReward(0, 0, reward)
      ).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });
  });

  describe("Milk", () => {
    it("grantRole function check", async () => {
      await milk.grantRole(MASTER_ROLE, deployer.address);
    });

    it("grantRole function restriction", async () => {
      await expect(
        milk.connect(addr1).grantRole(MASTER_ROLE, addr1.address)
      ).to.be.revertedWith(
        `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });

    it("mint function check", async () => {
      await milk.grantRole(MASTER_ROLE, deployer.address);
      await milk.mint(addr1.address, 100);
      expect(await milk.balanceOf(addr1.address)).to.be.equal(100);
    });

    it("withdraw function check", async () => {
      await milk.grantRole(MASTER_ROLE, deployer.address);
      await milk.mint(addr1.address, 100);
      await milk.connect(addr1).withdraw(20);
      expect(await milk.balanceOf(addr1.address)).to.be.equal(80);
    });

    it("mint should be reverted by non master", async () => {
      await expect(milk.mint(addr1.address, 100)).to.be.revertedWith(
        `AccessControl: account ${deployer.address.toLowerCase()} is missing role ${MASTER_ROLE}`
      );
    });

    it("withdraw should be reverted if amount exceeds balance", async () => {
      await expect(milk.connect(addr1).withdraw(20)).to.be.revertedWith(
        "ERC20: burn amount exceeds balance"
      );
    });
  });
});
