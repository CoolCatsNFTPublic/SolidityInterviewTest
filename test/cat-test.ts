import { Milk__factory } from './../typechain-types/factories/Milk__factory';
import { Milk } from './../typechain-types/Milk.d';
import { ItemFactory__factory } from './../typechain-types/factories/ItemFactory__factory';
import { ItemFactory } from './../typechain-types/ItemFactory.d';
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { ItemFactory, ItemFactory__factory } from "../typechain-types";

describe("ItemFactory Contract", function () {
  // let accounts: SignerWithAddress[];
  const uri: string = "https://ipfs.io";
  let itemFactory: ItemFactory;
  let milk: Milk;
  
  let deployer: SignerWithAddress;
  let acct1: SignerWithAddress;
  let acct2: SignerWithAddress;
  let accts: SignerWithAddress[];

  beforeEach(async function () {
    [deployer, acct1, acct2, ...accts] = await ethers.getSigners();

    const milkFactory = (await ethers.getContractFactory(
      "Milk", deployer
    )) as Milk__factory;

    const itemFactoryFactory = (await ethers.getContractFactory(
			"ItemFactory", deployer
		)) as ItemFactory__factory;

    milk = await milkFactory.deploy("Milk NFT", "MILK");
    await milk.deployed();

    itemFactory = await itemFactoryFactory.deploy(uri, milk.address);

  });

  describe("Deployments", function(){

    it("should properly deploy", async function () {
      const milkAddress = await itemFactory._milkContractAddress();
      expect(milkAddress).to.equal(milk.address);
    });
    
  });

  describe("Roles", function(){
    const depositorRole = "DEPOSITOR_ROLE";

    const depositorRoleBytes32 = ethers.utils.formatBytes32String(depositorRole)

    it("should grant roles", async function () {
      await itemFactory.grantRole(depositorRoleBytes32, acct1.address);
      const hasRole = await itemFactory.hasRole(depositorRoleBytes32, acct1.address);
      expect(hasRole).to.equal(true);
      

    });

  });

});