// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

// We can use log in solidity
import "hardhat/console.sol";

error FundMe__NotOwner();

contract FundMe {
  using PriceConverter for uint256;

  uint256 public constant MINIMUM_USD = 50*1e18;

  address[] private funders;
  mapping (address => uint256) private addressToAmountFunded;

  address private immutable i_owner;

  // rather than doing hardcoded hash for AggregatorV3Interface, we pass the address from the constructor, which is caught by getConversionRate in fund() and sent to PriceConverter.sol
  AggregatorV3Interface private priceFeed;

  constructor(address priceFeedAddress){
    // console.log("Minimum USD is: ", MINIMUM_USD);
    i_owner = msg.sender;
    priceFeed = AggregatorV3Interface(priceFeedAddress);
  }


  function fund() public payable {
    require(msg.value.getConversionRate(priceFeed) >= MINIMUM_USD, "Didn't send enough ether");
    funders.push(msg.sender);
    addressToAmountFunded[msg.sender] += msg.value;
    // console.log('User ', msg.sender, ' donated ',addressToAmountFunded[msg.sender]);
  }

  function withdraw() public onlyOwner {
    for (uint256 i = 0; i < funders.length; i++) {
      address funder = funders[i];
      addressToAmountFunded[funder] = 0;
    }
    funders = new address[](0);
    (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(callSuccess, "Call failed");
  }

  function getOwner() public view returns(address) {
    return i_owner;
  }

  function getFunder(uint256 index) public view returns(address){
    return funders[index];
  }

  function getAddressToAmountFunded(address funder) public view returns(uint256){
    return addressToAmountFunded[funder];
  }

  function getPriceFeed() public view returns (AggregatorV3Interface) {
    return priceFeed;
  }

  modifier onlyOwner {
    if(msg.sender != i_owner) 
      revert FundMe__NotOwner();
    _;
  }

  receive() external payable {
    fund();
  }

  fallback() external payable {
    fund();
  }
}