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


        /*Event is emitted for successful market item creation*/
        truffleAssert.eventEmitted(mint, 'MarketItemCreated');
        

    });

    /*Check that an auction listing can be listed*/
    it("Test Auction ", async() => {
        
        const auctionPrice = oneEth;
        const tokenID = 1;
        const auctionDuration = 120;
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        const initialBalanceBN = web3.utils.toBN(initialBalance);

        truffleAssert.passes(
            await marketInstance.createAuctionListing(auctionPrice, tokenID, auctionDuration, {
            from: accounts[0],
            })
         );
        


        /*Check that auction is open*/
        assert.strictEqual(await marketInstance.isAuctionOpen(1), true, "Auction should be open")
            
        /*Check that auction is not expired*/
        assert.strictEqual(await marketInstance.isAuctionExpired(1), false, "Auction should not be expired")
        
        /*Check that the owner cannot bid for what he listed*/
        await truffleAssert.reverts(
            marketInstance.bid(1,
            {from:accounts[0],value: oneEth.dividedBy(100)}),
            "cannot bid on what you own"
        );


        /*Check that the bidder cannot bid for less than below the bidding brice*/
        await truffleAssert.reverts(
            marketInstance.bid(1,
            {from:accounts[1],value: oneEth.dividedBy(100)}),
            "cannot bid below the latest bidding price"
        );
        

        /*Completting the Auction*/
        let bid = await marketInstance.bid(1, {from:accounts[1],value: oneEth});

        /*Check that auction cannot be completed if it is still open*/
        await truffleAssert.reverts(
            marketInstance.completeAuction(1,
            {from:accounts[1]}),
            "auction is still open"
        );
        

        /*Check that the auction can be completed by delaying the blocktime*/
        async function increaseBlockTime(timeToAdd) {
            await web3.currentProvider.send(
              { jsonrpc: "2.0", method: "evm_increaseTime", params: [timeToAdd], id: new Date().getTime() },
              () => {}
            );
            await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", id: new Date().getTime() }, () => {});
        }

        const currentBlock = await web3.eth.getBlock("latest");
        const desiredTimestamp = 1780802025;
        const timeToAdd = desiredTimestamp - currentBlock.timestamp;

        if (timeToAdd > 0) {
        await increaseBlockTime(timeToAdd); /*Increase the block timestamp*/
        }


        truffleAssert.passes(
            await marketInstance.completeAuction(1, {
            from: accounts[1],
            })
         );

         
         /*Check that the listing seller funcd increases after the auction is completed*/
        const afterBalance = await web3.eth.getBalance(accounts[0]);
        const afterBalanceBN = web3.utils.toBN(afterBalance);
        assert(afterBalanceBN.gt(initialBalanceBN), "Listing Seller should have received its funds from auction");
        

         /*Check that the auction is closed*/
        assert.strictEqual(await marketInstance.isAuctionExpired(1), true, "Auction should have expired");

    });


    /*Test Insurance*/
    it("Test Insurance for Tokens ", async() => {

        /*Check that only the owner can insure the token*/
        await truffleAssert.reverts(
            marketInstance.insureToken(1,
            {from:accounts[1],value: oneEth}),
            "Only the owner can insure tokens"
        );

        /*Check that the insure amount must be larger than the premium*/
        await truffleAssert.reverts(
            marketInstance.insureToken(1,
            {from:accounts[0],value: 0}),
            "Premium not paid"
        );

        /*Check that you cannot claim a insurance of a token that is not insured*/
        await truffleAssert.reverts(
            marketInstance.claimInsurance(1,
            {from:accounts[0]}),
            "Token is not insured"
        );


        let insured = await marketInstance.insureToken(1, {from:accounts[0],value: oneEth});
        
        /*Check that you cannot insure a token more than once*/
        await truffleAssert.reverts(
            marketInstance.insureToken(1,
            {from:accounts[0],value: oneEth}),
            "Token is already insured"
        );

        /*Check that only the owner can claim the insurance*/
        await truffleAssert.reverts(
            marketInstance.claimInsurance(1,
            {from:accounts[1]}),
            "Only owner of token can claim"
        );

        /*Check that the account value increases after claiming an insurance*/
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        const initialBalanceBN = web3.utils.toBN(initialBalance);

        let claimInsurance = await marketInstance.claimInsurance(1, {from:accounts[0]});
        
        const afterBalance = await web3.eth.getBalance(accounts[0]);
        const afterBalanceBN = web3.utils.toBN(afterBalance);

        assert(afterBalanceBN.gt(initialBalanceBN), "Balance should increase after claiming insurance");


    });


    /*Check that token can Be resell*/
    it("Test Token Resell", async() => {

        //Only the owner can resll back the item
        await truffleAssert.reverts(
            marketInstance.resellToken(1,
            oneEth.dividedBy(10),
            {from:accounts[0],value: oneEth.dividedBy(100)}),
            "Only item owner can perform this operation"
        );
        
        let getOwner = await marketInstance.getOwner(1,{from:accounts[1]});
        

    });

    /*Check that token can Be sale of a market item*/
    it("Test Market Sale", async() => {

        let mint2 = await marketInstance.createToken("https://example.com/my-token",oneEth,{from:accounts[2], value: oneEth.dividedBy(10)});
        
        //Check that only asking price equals to msg.value then the transcation goes through
        await truffleAssert.reverts(
            marketInstance.createMarketSale(2,
            {from:accounts[2],value: oneEth.dividedBy(1000)}),
            "Please submit the asking price in order to complete the purchase"
        );

        //Check that item Sold is correct
        let sale = await marketInstance.createMarketSale(2,{from:accounts[2],value: oneEth});
        const saleNumber = sale.logs[0].args.tokenId.toNumber();
        
        assert.strictEqual(
            2,
            saleNumber,
            "Item Sold Is Incorrect"
        )
    });
});
