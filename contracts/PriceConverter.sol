// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {

  function getPrice(AggregatorV3Interface priceFeed) internal view returns(uint256) {
    (,int256 answer,,,) = priceFeed.latestRoundData();
    return uint256(answer *1e10);
  }

  // here we catch the address, send it to getPrice and everything works the same on any network specified in helperHardhatConfig.js, so that we don't have to change the address personally everytime
  function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed) internal view returns(uint256) {
    uint256 ethPrice = getPrice(priceFeed);
    uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
    return ethAmountInUsd;
  }
}