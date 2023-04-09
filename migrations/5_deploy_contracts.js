const Werewolf = artifacts.require("Werewolf");

module.exports = function (deployer) {
  // Set up initial parameters for the game
  const playersCount = 5;
  const villagerCount = 3;
  const werewolfCount = 1;
  const seerCount = 1;

  // Deploy the Werewolf contract with the initial parameters
  deployer.deploy(Werewolf, playersCount, villagerCount, werewolfCount, seerCount);
};