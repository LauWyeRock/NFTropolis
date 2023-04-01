const werewolf = artifacts.require("WereWolf");

module.exports = function(deployer) {
  deployer.deploy(werewolf);
};