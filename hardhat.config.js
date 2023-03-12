require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()
require('hardhat-deploy');

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COIN_MARKET_CAP = process.env.COIN_MARKET_CAP

module.exports = {
  // solidity: "0.8.18",
  solidity: {
    compilers: [
      {version: "0.8.8"},
      {version: "0.6.6"}
    ]
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  // using hardhat-deploy helps in deployment, 
  // we then run npx hardhat deploy --network ${} and the contract deployment starts, rather than having to create scripts
  namedAccounts: {
    deployer: {
      default: 0,
    }
  }, 
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors:true,
    currency: "USD",
    coinmarketcap: COIN_MARKET_CAP,
    // token: "MATIC",
  }
};
