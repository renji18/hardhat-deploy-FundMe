const { network } = require("hardhat")
const { networkConfig, developmentChains } = require('../helperHardhatConfig');
const { verify } = require("../utils/verify");

module.exports = async ( { getNamedAccounts, deployments } ) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  
  let ethUsdPriceFeedAddress
  
  // we check if the contract network is a development network, 
  // if yes then we can access the MockV3Aggregator directly, as it was deployed before this deploy, 00 01
  if(developmentChains.includes(network.name)){
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
  }

  const args = [ethUsdPriceFeedAddress]

  // now we deploy the FundMe contract with the address for the Aggregator as the args in the constructor
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, // put price feed address
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1 // we wait confirmation blocks
  })

  // we check if the network is NOT a development network, and there is an etherscan api key,
  // then we proceed further with verify and publish on etherscan
  if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
    await verify(fundMe.address, args)
  }

  log("--------------------------------------------")
}

module.exports.tags = ["all", "fundme"]