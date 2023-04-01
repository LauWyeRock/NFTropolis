const transfer = artifacts.require("TransferFunds");

module.exports = function(deployer) {
  deployer.deploy(transfer);
};