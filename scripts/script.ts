import { run, ethers } from "hardhat";

async function main() {
  await run("compile");

  const uri = "https://ipfs.io";

  const [deployer] = await ethers.getSigners();

  const ItemFactory = await ethers.getContractFactory("ItemFactory");
  const Milk = await ethers.getContractFactory("Milk");
  const milk = await Milk.deploy("Milk NFT", "MILK");
  await milk.deployed();
  const itemFactory = await ItemFactory.deploy(uri, milk.address);
  await itemFactory.deployed();

  console.log("Milk address: ", milk.address);
  console.log("ItemFactory address: ", itemFactory.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });