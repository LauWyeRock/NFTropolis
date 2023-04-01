const _deploy_contracts = require("../migrations/4_deploy_contracts");
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');
const oneEth = new BigNumber(1000000000000000000);

var assert = require('assert');
const { ethers } = require("ethers");

var market = artifacts.require("../contracts/Marketplace.sol");

contract('Marketplace', function(accounts) {
    before(async () => {
        marketInstance= await market.deployed();
    });

    /*Check that only owner can update listing price*/
    it("Test Update Listing  Price", async() => {

        await truffleAssert.reverts(
            marketInstance.updateListingPrice(oneEth,
            {from:accounts[1]}),
            "only owner of the marketplace can change the listing price"
        );

        let updatePrice = await marketInstance.updateListingPrice(oneEth.dividedBy(10),{from:accounts[0]});

        //Check that the price is now update to one Eth
        let newPrice = await marketInstance.getListingPrice({from:accounts[0]})/1;

        assert.strictEqual(
            newPrice,
            oneEth/10,
            "Price is different from updated price"
        );
    });

    /*Check that minting token functions well*/
    it("Test Minting Token", async() => {

        /*Check that MarketItem Can Be Created*/

        //Check that Market Item Created Price must be >= 1 wei
        await truffleAssert.reverts(
            marketInstance.createToken("https://example.com/my-token",
            0,
            {from:accounts[1],value: oneEth.dividedBy(10)}),
            "Price must be at least 1 wei"
        );

        
        //Check that the msg.value is the same as listing Price.
        await truffleAssert.reverts(
            marketInstance.createToken("https://example.com/my-token",
            1,
            {from:accounts[1],value: oneEth.dividedBy(100)}),
            "Price must be equal to listing price"
        );


        //Check that the minting of token produces the correct tokenID.
        let mint = await marketInstance.createToken("https://example.com/my-token",oneEth,{from:accounts[0], value: oneEth.dividedBy(10)});

        
        const tokenID = mint.logs[0].args.tokenId.toNumber(); /*Need to convert the log(output of createToken()) using the following method.*/
        assert.strictEqual(
            tokenID,
            1,
            "Token Id is different from expected."
        );

        //Event is emitted for successful market item creation.
        truffleAssert.eventEmitted(mint, 'MarketItemCreated');
        

    });

    /*Check that token can Be resell*/
    it("Test Token Resell", async() => {

        //Only the owner can resll back the item
        await truffleAssert.reverts(
            marketInstance.resellToken(1,
            oneEth.dividedBy(10),
            {from:accounts[1],value: oneEth.dividedBy(100)}),
            "Only item owner can perform this operation"
        );
        
        let getOwner = await marketInstance.getOwner(1,{from:accounts[1]});
        

    });

    /*Check that token can Be sale of a market item*/
    it("Test Market Sale", async() => {
        
        //Check that only asking price equals to msg.value then the transcation goes through
        await truffleAssert.reverts(
            marketInstance.createMarketSale(1,
            {from:accounts[1],value: oneEth.dividedBy(1000)}),
            "Please submit the asking price in order to complete the purchase"
        );

        //Check that item Sold is correct
        let sale = await marketInstance.createMarketSale(1,{from:accounts[1],value: oneEth});
        const saleNumber = sale.logs[0].args.tokenId.toNumber();
        
        assert.strictEqual(
            1,
            saleNumber,
            "Item Sold Is Incorrect"
        )
    });
});

// import { ethers } from "hardhat";
// import { expect } from "chai";
// import { NFTAuction } from "../typechain-types/contracts";
// import nftAuctionDeployer from "./helpers/nft-auction.deployer";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { ethToWei, increaseTime, toUnits } from "./helpers/test.utils";

// describe.only("NFT Auction Test Cases", () => {
//   let nftAuctionContract: NFTAuction,
//     userMinter: SignerWithAddress,
//     bidder: SignerWithAddress,
//     bidder2: SignerWithAddress,
//     tokenId: number,
//     listingId: number;

//   before(async () => {
//     [userMinter, bidder, bidder2] = await ethers.getSigners();

//     ({ nftAuctionContract } = await nftAuctionDeployer());
//   });

//   it("It should mint an NFT", async () => {
//     // The user mints the NFT
//     const mintTrx: any = await nftAuctionContract
//       .connect(userMinter)
//       .mint("ape-vv-ss", userMinter.address);

//     const trxReceipt = await mintTrx.wait();
//     tokenId = Number(trxReceipt?.events[0]?.args["tokenId"]);

//     // NFT ID must be 1
//     expect(tokenId).to.be.equal(1);

//     // User minter must be the owner of NFT 1
//     expect(userMinter.address).to.be.equal(
//       await nftAuctionContract.ownerOf(tokenId)
//     );

//     // User minter must own NFT 1
//     expect(
//       Number(await nftAuctionContract.balanceOf(userMinter.address))
//     ).to.be.equal(1);
//   });

//   it("It should auction listing", async () => {
//     // The user create auction listing to run for 2 days
//     const auctionListingTrx: any = await nftAuctionContract
//       .connect(userMinter)
//       .createAuctionListing(ethToWei("0.3"), tokenId, 86400 * 2);

//     const trxReceipt = await auctionListingTrx.wait();
//     listingId = Number(trxReceipt?.events[2]?.args["listingId"]);

//     // Listing ID must be 1
//     expect(listingId).to.be.equal(1);

//     // The current contract must become escrow account
//     expect(nftAuctionContract.address).to.be.equal(
//       await nftAuctionContract.ownerOf(tokenId)
//     );
//   });

//   it("It should place bids, update bid, complete auction & withdraw funds", async () => {
//     const bidderBalanceBeforeBid = await ethers.provider.getBalance(
//       bidder.address
//     );
//     const bidder2BalanceBeforeBid = await ethers.provider.getBalance(
//       bidder2.address
//     );

//     // bidder 1 & 2 place their bids
//     await nftAuctionContract
//       .connect(bidder)
//       .bid(listingId, { value: ethToWei("0.6") });

//     await nftAuctionContract
//       .connect(bidder2)
//       .bid(listingId, { value: ethToWei("0.7") });

//     // bidder 1 updates his bid in order to become the highest bidder
//     await nftAuctionContract
//       .connect(bidder)
//       .bid(listingId, { value: ethToWei("0.2") });

//     const bidderBalanceAfterBid = await ethers.provider.getBalance(
//       bidder.address
//     );
//     const bidder2BalanceAfterBid = await ethers.provider.getBalance(
//       bidder2.address
//     );

//     expect(toUnits(bidderBalanceBeforeBid)).to.be.greaterThan(
//       toUnits(bidderBalanceAfterBid)
//     );
//     expect(toUnits(bidder2BalanceBeforeBid)).to.be.greaterThan(
//       toUnits(bidder2BalanceAfterBid)
//     );

//     // After 3 days the auction has ended
//     await increaseTime(3 * 86400);

//     const nftOwnerBalanceBeforeAuctionCompletion =
//       await ethers.provider.getBalance(userMinter.address);

//     // The highest bidder complete the auction
//     await nftAuctionContract.connect(bidder).completeAuction(listingId);

//     const nftOwnerBalanceAfterAuctionCompletion =
//       await ethers.provider.getBalance(userMinter.address);

//     // The NFT owner collects funds from the highest bidder
//     expect(toUnits(nftOwnerBalanceAfterAuctionCompletion)).to.be.greaterThan(
//       toUnits(nftOwnerBalanceBeforeAuctionCompletion)
//     );

//     // The Highest bidder becomes the new NFT owner
//     expect(await nftAuctionContract.ownerOf(tokenId)).to.be.equal(
//       bidder.address
//     );

//     expect(
//       Number(await nftAuctionContract.balanceOf(userMinter.address))
//     ).to.be.equal(0);
//     expect(
//       Number(await nftAuctionContract.balanceOf(bidder.address))
//     ).to.be.equal(1);

//     // The bidder 2 collects his funds after the auction has ended
//     const withdrawTrx = await nftAuctionContract
//       .connect(bidder2)
//       .withdrawBid(listingId);

//     const withdrawReceipt: any = await withdrawTrx.wait();
//     const withdrawBidder = withdrawReceipt.events[0]?.args["bidder"];
//     const withdrawBid = withdrawReceipt.events[0]?.args["bid"];

//     expect(withdrawBidder).to.be.equal(bidder2.address);
//     expect(toUnits(withdrawBid)).to.be.equal(0.7);
//   });
// });