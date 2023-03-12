// in the priceConverter, we used to pass hard coded hash address to get eth/usd data, but we can do something like if there is a hash address, we can pass it depending on what network we want to use, or what to do in case that we are running mock deployments without hash address

const networkConfig = {
  11155111: {
    name: "Sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
  },
  56: {
    name: "BNB",
    ethUsdPriceFeed: "0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e"
  }
}
  
const developmentChains = ["hardhat", "localhost"]

const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
}