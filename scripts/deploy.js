const hre = require("hardhat");

async function main() {
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarketplace = await NFTMarketplace.deploy();
  await nftMarketplace.deployed();

  // Transfer Funds
  // const TransferFunds = await hre.ethers.getContractFactory("TransferFunds");
  // const transferFunds = await TransferFunds.deploy();
  // await transferFunds.deployed();

  // Bidding
  // const TransferFunds = await hre.ethers.getContractFactory("TransferFunds");
  // const transferFunds = await TransferFunds.deploy();
  // await transferFunds.deployed();

  // Chat
  const ChatApp = await hre.ethers.getContractFactory("ChatApp");
  const chatApp = await ChatApp.deploy();
  await chatApp.deployed();

  // Voting
  // const TransferFunds = await hre.ethers.getContractFactory("TransferFunds");
  // const transferFunds = await TransferFunds.deploy();
  // await transferFunds.deployed();

  // Lottery
  // const TransferFunds = await hre.ethers.getContractFactory("TransferFunds");
  // const transferFunds = await TransferFunds.deploy();
  // await transferFunds.deployed();

  console.log(` deployed contract Address ${nftMarketplace.address}`);
  console.log(` Contract Address: ${chatApp.address}`);
  // console.log(` deployed contract Address ${nftMarketplace.address}`);
  // console.log(` deployed contract Address ${nftMarketplace.address}`);
  // console.log(` deployed contract Address ${nftMarketplace.address}`);
  // console.log(` deployed contract Address ${nftMarketplace.address}`);
  // console.log(` deployed contract Address ${nftMarketplace.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});