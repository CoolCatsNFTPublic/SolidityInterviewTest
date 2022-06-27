import { run, ethers } from "hardhat";

  async function main() {
    await run("compile");

    const url = "https://ipfs.io";

    const [deployer] = await ethers.getSigners();

    const ItemFactory = await ethers.getContractFactory("ItemFactory");

    const itemFactory = await ItemFactory.deploy(url);
    await itemFactory.deployed();
    console.log("Factory contract address: ", itemFactory.address);

    const Milk = await ethers.getContractFactory("Milk");
    const milk = await Milk.deploy("Milk NFT", "MILK", itemFactory.address);
    await milk.deployed();

    console.log("Milk contract address: ", milk.address);
  }

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });  