import { run, ethers } from "hardhat";

 async function main() {
   await run("compile");

   const uri = "https://ipfs.io";

   const [deployer] = await ethers.getSigners();

   const ItemFactory = await ethers.getContractFactory("ItemFactory");
   
   const itemFactory = await ItemFactory.deploy(uri);
   await itemFactory.deployed();

   const Milk = await ethers.getContractFactory("Milk");
   const milk = await Milk.deploy("Milk NFT", "MILK", itemFactory.address);
   await milk.deployed();

   console.log("Milk contract deployed at: ", milk.address);
   console.log("ItemFactory contract deployed at: ", itemFactory.address);

 }

 main()
   .then(() => process.exit(0))
   .catch((error) => {
     console.error(error);
     process.exit(1);
   }); 