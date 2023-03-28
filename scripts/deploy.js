const hre = require("hardhat");

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("Marketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();

  // Transfer Funds
  const TransferFunds = await hre.ethers.getContractFactory("TransferFunds");
  const transferFunds = await TransferFunds.deploy();
  await transferFunds.deployed();

  // Bidding
  const Bidding = await hre.ethers.getContractFactory("NftAuction");
  const bidding = await Bidding.deploy();
  await bidding.deployed();

  // Chat
  const ChatApp = await hre.ethers.getContractFactory("ChatApp");
  const chatApp = await ChatApp.deploy();
  await chatApp.deployed();

  // Voting
  // const TransferFunds = await hre.ethers.getContractFactory("TransferFunds");
  // const transferFunds = await TransferFunds.deploy();
  // await transferFunds.deployed();

  // Lottery
  const Lottery = await hre.ethers.getContractFactory("LotteryGame");
  const lottery = await Lottery.deploy();
  await lottery.deployed();

  console.log(` Marketplace contract Address ${nftMarketplace.address}`);
  console.log(` Chatapp contract Address: ${chatApp.address}`);
  console.log(` lottery contract Address ${lottery.address}`);
  console.log(` transferfunds contract Address ${transferFunds.address}`);
  console.log(` bidding contract Address ${bidding.address}`);
  // console.log(` deployed contract Address ${nftMarketplace.address}`);
  // console.log(` deployed contract Address ${nftMarketplace.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});