const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helperHardhatConfig");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe;
      let demoAccount;
      let mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1"); //1000000000000000000

      this.beforeEach(async function () {
        // we create a named account using getNamedAccounts().deployer, so that whenever we make any txn from a contract connected to demoAccount, it will be from that demoAccount account
        demoAccount = (await getNamedAccounts()).deployer;

        // deploys all contracts using hardhat-deploy
        await deployments.fixture(["all"]);

        // whenever we call a func from fundMe, it will be from the demoAccount account we just created
        fundMe = await ethers.getContract("FundMe", demoAccount);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          demoAccount
        );
      });

      describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.reverted
        });
        it("adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, demoAccount);
        });
        it("updated the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(demoAccount);
          assert.equal(response.toString(), sendValue.toString());
        });
      });

      describe("withdraw", async function () {
        this.beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });
        it("withdraw ETH from a single founder", async function () {
          //starting balance int the contract
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          //starting balance of the account
          const startingDeployerBalance = await fundMe.provider.getBalance(
            demoAccount
          );

          // running the txns and the method withdraw
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);

          // calculating gas cost for the txn
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );

          const endingDeployerBalance = await fundMe.provider.getBalance(
            demoAccount
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance),
            endingDeployerBalance.add(gasCost).toString()
          );
        });
        it("allows us to withdraw from multiple funders", async function () {
          // for multiple users we get demo users from ether.getSigners()
          const accounts = await ethers.getSigners();
          for (let i = 0; i < 6; i++) {
            const fundMeConnectedAccounts = await fundMe.connect(accounts[i]);
            await fundMeConnectedAccounts.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            demoAccount
          );

          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerBalance = await fundMe.provider.getBalance(
            demoAccount
          );

          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance),
            endingDeployerBalance.add(gasCost).toString()
          );

          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 0; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
        it("only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedAccount = await fundMe.connect(attacker);
          await expect(
            attackerConnectedAccount.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
      });
    });
