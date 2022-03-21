import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const {
    deployments: { deploy },
    getNamedAccounts,
  } = hre;
  const {deployer} = await getNamedAccounts();
  const ItemFactory = await deploy("ItemFactory", {
    from: deployer,
    log: true,
    args: [
      "https://ipfs.io/ipfs/QmQtN81i9eNrD3wxcr67scDpLvZDDXxbmAvNXMaZh3D6tB/",
    ],
  });

  await deploy("Milk", {
    from: deployer,
    log: true,
    args: [
      "Milk", "Milk", ItemFactory.address,
    ],
  });

};

export default func;
func.tags = ['ItemFactory', 'Milk'];