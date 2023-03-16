const { network } = require('hardhat');
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require('../helperHardhatConfig');

// this is a mock deploy file, as it is 00, it will be the first to be deployed if all deployments are done

// we catch getNamedAccounts, deployments from hre(hardhat runtime environment)
module.exports = async ( { getNamedAccounts, deployments }) => {
  // deploy is used to deploy a contract which has been compiled
  // deployments is a collection which has all the compiled contract, which can be accessed from deployments.get()
  const { deploy, log } = deployments
  
  // deployer is the account which is active and using the contract
  const { deployer } = await getNamedAccounts()

  // we check if the network is any of the custom specified developmentChains from helperHHardhatConfig.js
  // If yes, then there is no eth/usd address, so ve run a mock sol contract
  if(developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...")
    log("-------------------------------------------------")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator", 
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER] // arguments for the constructor
    })
    log("-------------------------------------------------")
    log("Mocks deployed!")
  }
}

module.exports.tags = ["all", "mocks"]