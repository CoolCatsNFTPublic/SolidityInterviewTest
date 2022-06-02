/* eslint-disable node/no-missing-import */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { expect } from "chai";
import { ethers } from "hardhat";
import { Milk } from "../typechain-types";

describe("Milk Contract", function () {
  let milkContract: Milk;
  beforeEach( async function() {
    const [,signer] = await ethers.getSigners()
    const signer1 = await ethers.getSigner(signer.address);

    const MilkContract = await ethers.getContractFactory("Milk");
    // @ts-ignore
    milkContract = await MilkContract.connect(signer1).deploy("GHOST", "Ghst");
    milkContract.deployed();
  });

  it("Deposit Milk", async function () {
    const [,signer, signer2] = await ethers.getSigners()
    const signer1 = await ethers.getSigner(signer.address);
    const signer2s = await ethers.getSigner(signer2.address);

    const MASTER_ROLE = ethers.utils.id("MASTER_ROLE");
    const DEPOSITOR_ROLE = ethers.utils.id("DEPOSITOR_ROLE");

    const bigNum = ethers.BigNumber.from("50")
    const depositData = "0x0000000000000000000000000000000000000000000000000000000000000032"

    const grantRole = await milkContract.connect(signer1).grantRole(DEPOSITOR_ROLE, signer2.address)
    await grantRole.wait();
    const balBefore = await milkContract.balanceOf(signer1.address);
    const totalSupplyBefore = await milkContract.totalSupply();

    const deposit = await milkContract.connect(signer2s).deposit(signer1.address, depositData);

    const balanceAfter = await milkContract.balanceOf(signer1.address);
    const totalSupplyAfter = await milkContract.totalSupply();
  
    const balance = Number(balBefore.toString()) + 50; 
    const ts = Number(totalSupplyBefore.toString()) + 50;
    expect(Number(balanceAfter.toString())).to.equal(balance);
    expect(Number(totalSupplyAfter.toString())).to.equal(ts);
  });

  it("Withdraw Milk", async function () {
    const [,signer, signer2] = await ethers.getSigners()
    const signer1 = await ethers.getSigner(signer.address);
    const signer2s = await ethers.getSigner(signer2.address);

    const MASTER_ROLE = ethers.utils.id("MASTER_ROLE");

    const grantRole = await milkContract.connect(signer1).grantRole(MASTER_ROLE, signer2.address)
    await grantRole.wait();
    const mint = await milkContract.connect(signer2s).mint(signer1.address, 200);
    const balBefore = await milkContract.balanceOf(signer1.address);
    const totalSupplyBefore = await milkContract.totalSupply();
        
    const burn = await milkContract.withdraw('100');
    await burn.wait();

    const balanceAfter = await milkContract.balanceOf(signer1.address);
    const totalSupplyAfter = await milkContract.totalSupply();
    
    const balance = Number(balBefore.toString()) - 100; 
    const ts = Number(totalSupplyBefore.toString()) - 100;
    expect(Number(balanceAfter.toString())).to.equal(balance);
    expect(Number(totalSupplyAfter.toString())).to.equal(ts);
  });

  
  it("Mint Milk", async function () {
    const [,signer, signer2] = await ethers.getSigners()
    const signer1 = await ethers.getSigner(signer.address);
    const signer2s = await ethers.getSigner(signer2.address);

    const MASTER_ROLE = ethers.utils.id("MASTER_ROLE");

    const grantRole = await milkContract.connect(signer1).grantRole(MASTER_ROLE, signer2.address)
    await grantRole.wait();
    const balBefore = await milkContract.balanceOf(signer1.address);
    const totalSupplyBefore = await milkContract.totalSupply();
    const mint = await milkContract.connect(signer2s).mint(signer1.address, 200);
  

    const balanceAfter = await milkContract.balanceOf(signer1.address);
    const totalSupplyAfter = await milkContract.totalSupply();
    
    const balance = Number(balBefore.toString()) + 200; 
    const ts = Number(totalSupplyBefore.toString()) + 200;
    expect(Number(balanceAfter.toString())).to.equal(balance);
    expect(Number(totalSupplyAfter.toString())).to.equal(ts);
  });

});