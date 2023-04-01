const RPGToken = artifacts.require("RPGToken");
const nftQuest = artifacts.require("nftQuest");

module.exports = async function (deployer, network, accounts) {
  /*Set initial supply for RPGToken*/
  const initialSupply = 1000000000000;

  /*Deploy RPGToken contract*/
  await deployer.deploy(RPGToken, initialSupply);
  const rpgTokenInstance = await RPGToken.deployed();

  /*Deploy nftQuest contract*/
  await deployer.deploy(nftQuest, rpgTokenInstance.address);
};