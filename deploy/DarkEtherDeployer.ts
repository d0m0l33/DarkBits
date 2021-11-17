
const hre = require("hardhat");
export enum DevNets {
  main = 0,
  mainFork,
  kovan,
  kovanFork,
  polygonFork
}

let currentNetwork = DevNets.polygonFork;
module.exports = async ({
  getNamedAccounts,
  deployments,
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log('Current network : ',currentNetwork)
  if(currentNetwork === DevNets.polygonFork ) {
    const DarkBits = await deploy("DarkBits", {
      from: deployer,
      args: [
       ],
    });
    console.log('DarkBits deployed to polygonFork @ : ',DarkBits.address)
  } else {
    console.error('Please set a supported network.');
  }

};

