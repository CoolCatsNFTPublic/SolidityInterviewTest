/* eslint-disable prettier/prettier */
import { ethers } from "hardhat";
import { Signer } from "ethers";

async function main() {

const milkDeploy = await ethers.getContractFactory('Milk');
const milkdeploy = await milkDeploy.deploy('PamPam', "PAMPAM");

await milkdeploy.deployed();

console.log(`Here is the address of Milk Contract ${milkdeploy.address}`);



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});