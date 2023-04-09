const _deploy_contracts = require("../migrations/3_deploy_contracts");
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');
const oneEth = new BigNumber(1000000000000000000);

var assert = require('assert');
const { ethers } = require("ethers");

var lottery = artifacts.require("../contracts/LotteryGame.sol");


contract('LotteryGame', function(accounts) {
    before(async () => {
        lotteryInstance= await lottery.deployed();
    });


    /*Test Request Buy Ticket*/
    it("Test Request Buy Ticket", async() => {

        /*Check the number of Buy ticket Request is correct*/
        let request = await lotteryInstance.requestBuyTickets(5, {from:accounts[1]});
        let getRequest = await lotteryInstance.getBuyRequest(accounts[1],{from:accounts[1]});

        assert.equal(getRequest[0], 5, "Number of Buy Request Tickets Don't Match");
    });



    /*Test Buy Ticket*/
    it("Test Buy Ticket", async() => {

        /*Check that the amount must be correct*/
        await truffleAssert.reverts(
            lotteryInstance.BuyTickets({
            from: accounts[1],
            value: 0,
            }),
            "the value must be multiple of 0.01 Ether"
        );


        /*Check that the timeStamp must be correct to buy ticket*/
        const etherAmount = 0.05;
        const weiAmount = etherAmount * (10 ** 18);

        await truffleAssert.reverts(
            lotteryInstance.BuyTickets({
            from: accounts[1],
            value:  weiAmount,
            }),
            "Wait a while to buy"
        );


        /*Check that you cannot buy more than the no. of remaining ticket*/
        let request2 = await lotteryInstance.requestBuyTickets(105, {from:accounts[2]});


        /* Delaying the block timestamp*/
        async function increaseBlockTime(timeToAdd) {
            await web3.currentProvider.send(
              { jsonrpc: "2.0", method: "evm_increaseTime", params: [timeToAdd], id: new Date().getTime() },
              () => {}
            );
            await web3.currentProvider.send({ jsonrpc: "2.0", method: "evm_mine", id: new Date().getTime() }, () => {});
        }

        const timeToAdd =  7200 ;

        if (timeToAdd > 0) {
            await increaseBlockTime(timeToAdd); /*Increase the block timestamp to 2 hrs later*/
        }

        const weiAmount2 = 1.05 * (10 ** 18);

        await truffleAssert.reverts(
            lotteryInstance.BuyTickets({
            from: accounts[2],
            value:  weiAmount2,
            }),
            "Not enough tickets available."
        );
        
    });



    /*Test Draw Ticket 1*/
    it("Test Draw Winner Ticket 1", async() => {

        /*Check that only the operator can draw the winning ticket */
        await truffleAssert.reverts(
            lotteryInstance.DrawWinnerTicket({
            from: accounts[1],
            }),
            "Only the lottery operator can do this"
        );


        /*Check that the no. of tickets cannot be 0 to draw the winning ticket*/
        await truffleAssert.reverts(
            lotteryInstance.DrawWinnerTicket({
            from: accounts[0],
            }),
            "No tickets were purchased"
        );

    });



    /*Test Restart Draw*/
    it("Test Restart Draw", async() => {

        /*Check that only the owner can restart the drawing */
        await truffleAssert.reverts(
            lotteryInstance.restartDraw({
            from: accounts[1],
            }),
            "Only the lottery operator can do this"
        );


        /*Check that the owner can restart the drawing*/
        truffleAssert.passes(
            await lotteryInstance.restartDraw({
            from: accounts[0],
            })
        );
        

        /*Check that cannot restart a lottery that is still in play*/
        const etherAmount = 0.05;
        const weiAmount = etherAmount * (10 ** 18);
        
        let buyTicket = await lotteryInstance.BuyTickets({from: accounts[1], value:  weiAmount,});

        await truffleAssert.reverts(
            lotteryInstance.restartDraw({
            from: accounts[0],
            }),
            "Cannot Restart Draw as Draw is in play"
        );
    });



    /*Test Draw Ticket 2 & Winnings/Commission Withdrawl*/
    it("Test Draw Winner Ticket 2 & Withdrawl Winnings/Comission", async() => {


        const initialBalance = await web3.eth.getBalance(accounts[1]);
        const initialBalanceBN = web3.utils.toBN(initialBalance);
        const initialBalance2 = await web3.eth.getBalance(accounts[0]);
        const initialBalanceBN2 = web3.utils.toBN(initialBalance2);


        let drawTicket = await lotteryInstance.DrawWinnerTicket({from: accounts[0]});

        /*Check that account[1] is the winner*/
        assert.strictEqual(await lotteryInstance.IsWinner({from: accounts[1]}), true, "Account 1 should have been the winner");


        /*Check that winning amount is correct*/
        const etherAmount = 0.045;
        const weiAmount = etherAmount * (10 ** 18);

        assert.strictEqual(await lotteryInstance.checkWinningsAmount({from: accounts[1]})/1, weiAmount, "Winning Amount is incorrect");


        /*Check that the operator comission is correct*/
        const etherAmount2 = 0.005;
        const weiAmount2 = etherAmount2 * (10 ** 18);

        assert.strictEqual(await lotteryInstance.getOperatorTotalCommission({from: accounts[1]})/1, weiAmount2, "Operator Comission is incorrect")


        /*Check that the balance of account[1] increases after withdrawing the winnings*/
        await lotteryInstance.WithdrawWinnings({from: accounts[1]});
        const afterBalance = await web3.eth.getBalance(accounts[1]);
        const afterBalanceBN = web3.utils.toBN(afterBalance);

        assert(afterBalanceBN.gt(initialBalanceBN), "Account[1] should have received its winnings.");


        /*Check that the balance of operator increases after withdrawing the comission*/
        await lotteryInstance.WithdrawCommission({from: accounts[0]});
        const afterBalance2 = await web3.eth.getBalance(accounts[0]);
        const afterBalanceBN2 = web3.utils.toBN(afterBalance2);

        assert(afterBalanceBN.gt(initialBalanceBN), "Operator should have received its comission.");

    });



    

});