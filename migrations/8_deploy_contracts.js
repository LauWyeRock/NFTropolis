const RPGToken = artifacts.require("RPGToken");

module.exports = function (deployer, network, accounts) {
  const initialSupply = 1000000; 

  deployer.deploy(RPGToken, initialSupply);
};