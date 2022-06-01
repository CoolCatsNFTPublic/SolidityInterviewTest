/* eslint-disable node/no-missing-import */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { expect } from "chai";
import { Address } from "cluster";
import { ethers } from "hardhat";
import { Milk } from "../typechain-types";

describe("Staking Contract", function () {
  let milkContract: Milk;
  beforeEach( async function() {
    const [,signer] = await ethers.getSigners()
    const signer1 = await ethers.getSigner(signer.address);

    const MilkContract = await ethers.getContractFactory("Milk");
    // @ts-ignore
    milkContract = await MilkContract.connect(signer1).deploy("GHOST", "Ghst");
    milkContract.deployed();
  });

  it("withdraw", async function () {
    const [,signer] = await ethers.getSigners()
    const MASTER_ROLE = ethers.utils.id("MASTER_ROLE");
    console.log(MASTER_ROLE);

    // 0x8b8c0776df2c2176edf6f82391c35ea4891146d7a976ee36fd07f1a6fb4ead4c
    
    // const signer1 = await ethers.getSigner(signer.address);
    // const mint = await milkContract.mint(signer1.address, 200);
    // const balBefore = await milkContract.balanceOf(signer1.address);

    // console.log(`The balance when mint is done ${balBefore}`);
    
    // const burn = await milkContract.withdraw('100');

    // const balanceOf = await milkContract.balanceOf(signer1.address);
    // const balance = Number(balanceOf.toString()) - 100; 
    // // const transferToContract = await ghostContractAddr.connect(signer1).transfer(ghostContractAddr.address, "9000000000000000000000");
    // // const balContract = await ghostContractAddr.balanceOf(ghostContractAddr.address);
    // expect(balanceOf.toString()).to.equal(balance);
  });

});