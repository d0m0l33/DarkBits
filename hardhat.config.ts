import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy-ethers";
import "hardhat-deploy";
import "@symfoni/hardhat-react";
import "hardhat-typechain";
import "@typechain/ethers-v5";

import "@nomiclabs/hardhat-etherscan";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more




/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  react: {
    providerPriority: ["web3modal", "hardhat"],
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
   // apiKey: process.env.ETHERSCAN_TOKEN
    apiKey: process.env.POLYGONSCAN_TOKEN
  },
  
  networks: {
    hardhat: {
      forking: {
        enabled: true,
        // url: process.env.MAINNET_NODE_URL,
        // blockNumber: 13354111,
        url: process.env.POLYGON_NODE_URL,
        blockNumber: 20434614,
        
      },      
      inject: false, // optional. If true, it will EXPOSE your mnemonic in your frontend code. Then it would be available as an "in-page browser wallet" / signer which can sign without confirmation.
      // accounts: {
      //   mnemonic: "test test test test test test test test test test test junk", // test test test test test test test test test test test junk
      // },
      accounts: [
        {
          balance: "10000000000000000000000",
          privateKey: process.env.PRIVATE_KEY_0_ETHMAIN,

        },
        {
          balance: "10000000000000000000000",
          privateKey: process.env.PRIVATE_KEY_0_POLYGON,

        },
        {
          balance: "10000000000000000000000",
          privateKey: process.env.PRIVATE_KEY_1_POLYGON,
        },
      ],
    },
    kovan: {
      url: process.env.KOVAN_NODE_URL,
      accounts: [process.env.PRIVATE_KEY_0_ETHMAIN]
    },
    polygon: {
      accounts: [process.env.PRIVATE_KEY_0_POLYGON_PROD],
      url: process.env.POLYGON_NODE_URL,     
    },
    mumbai: {
      url: process.env.MUMBAI_NODE_URL,
      accounts: [process.env.PRIVATE_KEY_1_POLYGON],
    },
    main: {
      url: process.env.MAINNET_NODE_URL,
      accounts: [process.env.PRIVATE_KEY_0_ETHMAIN],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
        },
      },
    ],
  },
};
export default config;
