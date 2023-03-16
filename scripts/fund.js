const { getNamedAccounts, ethers } = require('hardhat');

async function main(){
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer)
  console.log('Funding contract...');
  const txnResponse = await fundMe.fund({
    value: ethers.utils.parseUnits('0.2', 18)
  })
  await txnResponse.wait(1)
  console.log('Funded');
}   

main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.log(e);
    process.exit(1)
  })