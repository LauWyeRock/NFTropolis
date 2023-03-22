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