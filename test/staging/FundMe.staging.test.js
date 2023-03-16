const { ethers, getNamedAccounts, network } = require("hardhat");
const { assert } = require("chai");
const { developmentChains } = require("../../helperHardhatConfig");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let networkDeployedAccount;
      const sendValue = ethers.utils.parseUnits('0.2', 18)

      this.beforeEach(async function () {
        networkDeployedAccount = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", networkDeployedAccount);
      });

      it("allows people to fund and withdraw", async function() {
        await fundMe.fund({value: sendValue})
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundMe.address)
        assert.equal(endingBalance.toString(), '0')
      })
    });
