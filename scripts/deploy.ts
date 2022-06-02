import { ethers } from "hardhat";

async function main() {
  const MilkContract = await ethers.getContractFactory("Milk");
  const milkcontract = await MilkContract.deploy("Milk", "MILK");

  await milkcontract.deployed();

  console.log("Milk Contract Deployed to: ", milkcontract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
