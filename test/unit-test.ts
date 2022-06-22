import { ethers } from "hardhat";
import chai from "chai";
const { expectRevert, time } = require("@openzeppelin/test-helpers");
import { solidity } from "ethereum-waffle";
const keccak256 = require("keccak256");
import {
    ItemFactory__factory,
    Milk__factory,
    MockTestContract__factory,
    ItemFactory,
    Milk,
    MockTestContract
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
    let mockTestContract: MockTestContract;
    let deployer: SignerWithAddress,
        address1: SignerWithAddress,
        address2: SignerWithAddress;
    let DEPOSITOR_ROLE: string,
        CONTRACT_ROLE: string,
        MASTER_ROLE: string,
        ADMIN_ROLE: string,
        DEFAULT_ADMIN_ROLE = ethers.utils.hexZeroPad("0x00", 32);

    beforeEach(async () => {
        [deployer, address1, address2] = await ethers.getSigners();

        const ITEMFACTORY = new ItemFactory__factory(deployer);
        itemFactory = await ITEMFACTORY.deploy(deployer.address);

        const MILK = new Milk__factory(deployer);
        milk = await MILK.deploy("Milk", "Milk", itemFactory.address);

        const MOCKTESTCONTRACT = new MockTestContract__factory(deployer);
        mockTestContract = await MOCKTESTCONTRACT.deploy(milk.address);

        DEPOSITOR_ROLE = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("DEPOSITOR_ROLE")
        );

        CONTRACT_ROLE = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("CONTRACT_ROLE")
        );

        MASTER_ROLE = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("MASTER_ROLE")
        );

        ADMIN_ROLE = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes("ADMIN_ROLE")
        );
    });

    describe("Constructor", () => {

        it("Should deploy with the correct roles for factory", async () => {
            expect(
                await itemFactory.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)
            ).to.equal(true);

            expect(
                await itemFactory.hasRole(ADMIN_ROLE, deployer.address)
            ).to.equal(true);
        });

        it("Should deploy with the correct roles for milk", async () => {
            expect(await milk.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.equal(
                true
            );
            expect(
                await milk.hasRole(keccak256("CONTRACT_ROLE"), itemFactory.address)
            ).to.equal(true);
        });
    });

    describe("ItemFactory", () => {
        it("should allow deployer execute setMilkContractAddress", async () => {
            await itemFactory.setMilkContractAddress(milk.address);
            expect(await itemFactory._milkContractAddress()).to.equal(milk.address);
        });

        it("should allow deployer execute setRarityRolls", async () => {
            await itemFactory.setRarityRolls(80, 100, 120, 140, 160, 180);
            expect(await itemFactory._commonRoll()).to.equal(80);
            expect(await itemFactory._uncommonRoll()).to.equal(100);
            expect(await itemFactory._rareRoll()).to.equal(120);
            expect(await itemFactory._epicRoll()).to.equal(140);
            expect(await itemFactory._legendaryRoll()).to.equal(160);
            expect(await itemFactory._maxRarityRoll()).to.equal(180);
        });

        it("should revert upon calling setRarityRolls if required conditions are not met", async () => {
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
            let reward = web3.eth.abi.encodeParameters(
                ["uint256", "uint256", "uint256[]"],
                [20, 80, [2, 3, 4]]
            );
            await itemFactory.setReward(0, 0, reward);
            expect(await itemFactory._rewardMapping(0, 0)).to.equal(reward);
        });

        describe("claim()", () => {
            beforeEach(async () => {
                await itemFactory.setMilkContractAddress(milk.address);
                await itemFactory.setRarityRolls(80, 100, 120, 140, 160, 180);

                let reward1 = web3.eth.abi.encodeParameters(
                    ["uint256", "uint256", "uint256[]"],
                    [120, 180, [1, 2, 3]]
                );
                let reward2 = web3.eth.abi.encodeParameters(
                    ["uint256", "uint256", "uint256[]"],
                    [120, 280, [1, 2, 3]]
                );
                let reward3 = web3.eth.abi.encodeParameters(
                    ["uint256", "uint256", "uint256[]"],
                    [220, 380, [1, 2, 3]]
                );
                let reward4 = web3.eth.abi.encodeParameters(
                    ["uint256", "uint256", "uint256[]"],
                    [120, 380, [1, 2, 3]]
                );
                let reward5 = web3.eth.abi.encodeParameters(
                    ["uint256", "uint256", "uint256[]"],
                    [2, 4, [1, 2, 3]]
                );

                await itemFactory.setReward(0, 1, reward1);
                await itemFactory.setReward(0, 2, reward2);
                await itemFactory.setReward(0, 3, reward3);
                await itemFactory.setReward(0, 4, reward4);
                await itemFactory.setReward(1, 0, reward5);
            });

            it("should revert if claim() is called twice within a day by the same account", async () => {
                await itemFactory.claim(deployer.address, 1111);
                await expect(
                    itemFactory.claim(deployer.address, 1111)
                ).to.be.revertedWith("Claim once per day");
            });

            it("user can execute claim() after a day or 86400 seconds", async () => {
                await itemFactory.claim(deployer.address, 1111);
                await ethers.provider.send("evm_increaseTime", [86400]);
                await ethers.provider.send("evm_mine", []);
                await itemFactory.claim(deployer.address, 1111);
            });
        });

        it("setMilkContractAddress, setRarityRolls, setReward are reverted with non deployer", async () => {
            await expect(
                itemFactory.connect(address1).setMilkContractAddress(milk.address)
            ).to.be.revertedWith(
                `AccessControl: account ${address1.address.toLowerCase()} is missing role ${ADMIN_ROLE}`
            );

            await expect(
                itemFactory.connect(address1).setRarityRolls(80, 100, 120, 140, 160, 180)
            ).to.be.revertedWith(
                `AccessControl: account ${address1.address.toLowerCase()} is missing role ${ADMIN_ROLE}`
            );

            let reward = web3.eth.abi.encodeParameters(
                ["uint256", "uint256", "uint256[]"],
                [20, 80, [2, 3, 4]]
            );
            await expect(
                itemFactory.connect(address1).setReward(0, 0, reward)
            ).to.be.revertedWith(
                `AccessControl: account ${address1.address.toLowerCase()} is missing role ${ADMIN_ROLE}`
            );
        });
    });

    describe("Milk", () => {
        describe("grantRole()", () => {
            it("grantRole function check", async () => {
                await milk.grantRole(MASTER_ROLE, deployer.address);
            });

            it("grantRole should revert if caller is not default admin", async () => {
                await expect(
                    milk.connect(address1).grantRole(MASTER_ROLE, address1.address)
                ).to.be.revertedWith(
                    `AccessControl: account ${address1.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
                );
            });
        });

        it("should increase balance after mint", async () => {
            await milk.grantRole(MASTER_ROLE, deployer.address);
            expect(await milk.balanceOf(address1.address)).to.be.equal(0)
            await milk.mint(address1.address, 100);
            expect(await milk.balanceOf(address1.address)).to.be.equal(100);
        });

        it("should decrease balance after withdraw", async () => {
            await milk.grantRole(MASTER_ROLE, deployer.address);
            await milk.mint(address1.address, 100);
            await milk.connect(address1).withdraw(20);
            expect(await milk.balanceOf(address1.address)).to.be.equal(100 - 20);
        });

        it("should revert if user without master role calls mint", async () => {
            await expect(milk.mint(address1.address, 100)).to.be.revertedWith(
                `AccessControl: account ${deployer.address.toLowerCase()} is missing role ${MASTER_ROLE}`
            );
        });

        it("should revert if withdraw amount exceeds balance", async () => {
            await milk.grantRole(MASTER_ROLE, deployer.address);
            await milk.mint(address1.address, 100);

            await expect(milk.connect(address1).withdraw(120)).to.be.revertedWith(
                "ERC20: burn amount exceeds balance"
            );
        });

        describe("deposit", async () => {
            beforeEach(async () => {
                await milk.grantRole(DEPOSITOR_ROLE, address1.address);
            });

            it("should deposit from user with depositor role", async function () {
                await expect(
                    milk
                        .connect(address1)
                        .deposit(
                            deployer.address,
                            web3.eth.abi.encodeParameters(["uint256"], [100])
                        )
                )
                    .to.emit(milk, "Transfer")
                    .withArgs(ethers.constants.AddressZero, deployer.address, 100);
            });

            it("should revert if depositing from account without depositor role", async function () {
                await expect(
                    milk
                        .connect(address2)
                        .deposit(
                            deployer.address,
                            web3.eth.abi.encodeParameters(["uint256"], [100])
                        )
                ).to.be.revertedWith(
                    `AccessControl: account ${address2.address.toLowerCase()} is missing role ${DEPOSITOR_ROLE}`
                );
            });
        });

        it("should allow contract with contract role call gameMint()", async () => {
            await milk.grantRole(CONTRACT_ROLE, mockTestContract.address);
            await mockTestContract.gameMint(address1.address, 100);
            expect(await milk.balanceOf(address1.address)).to.be.equal(100);
        });

        it("gameBurn", async () => {
            await milk.grantRole(CONTRACT_ROLE, mockTestContract.address);
            await mockTestContract.gameMint(address1.address, 100);
            expect(await milk.balanceOf(address1.address)).to.be.equal(100);
            await mockTestContract.gameBurn(address1.address, 10);
            expect(await milk.balanceOf(address1.address)).to.be.equal(90);
        });

        it("gameTransferFrom", async () => {
            await milk.grantRole(CONTRACT_ROLE, mockTestContract.address);
            await mockTestContract.gameMint(address1.address, 100);
            expect(await milk.balanceOf(address1.address)).to.be.equal(100);
            await mockTestContract.gameTransferFrom(address1.address, address2.address, 55);
            expect(await milk.balanceOf(address1.address)).to.be.equal(45);
            expect(await milk.balanceOf(address2.address)).to.be.equal(55);
        });

        it("gameWithdraw", async () => {
            await milk.grantRole(CONTRACT_ROLE, mockTestContract.address);
            await mockTestContract.gameMint(address1.address, 100);
            expect(await milk.balanceOf(address1.address)).to.be.equal(100);
            await mockTestContract.gameWithdraw(address1.address, 10);
            expect(await milk.balanceOf(address1.address)).to.be.equal(90);
        });
    });
});