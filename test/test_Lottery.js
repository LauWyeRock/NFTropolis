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



    it("Test Buy Ticket", async() => {

        //Check that the value of purchase ticket is in the multiple of ticketPrice
        await truffleAssert.reverts(
            lotteryInstance.BuyTickets(
            {from:accounts[1], value:oneEth * 0.015}),
            "the value must be multiple of 0.01 Ether"
        );

        //Check that you cannot purchase more than the remaining ticket
        await truffleAssert.reverts(
            lotteryInstance.BuyTickets(
            {from:accounts[1], value:oneEth * 2}),
            "Not enough tickets available."
        );
    });



    //Note:That account[0] will be the default Lottery Operator
    it("Test Draw Ticket", async() => {

        //Check that there is at least one ticket purchases
        await truffleAssert.reverts(
            lotteryInstance.DrawWinnerTicket(
            {from:accounts[0]}),
            "No tickets were purchased"
        );

        //Buying of 2 lottery Ticket
        let buyTicket = await lotteryInstance.BuyTickets({from:accounts[4], value: 0.02 * oneEth});
        let drawTicket = await lotteryInstance.DrawWinnerTicket({from:accounts[0]});
        let isWinner = await lotteryInstance.IsWinner({from:accounts[4]});

        //Check that accounts[4] will be a winner after drawing
        assert.strictEqual(
            isWinner,
            true,
            "Winner selected is wrong"
        )

        //Check the amount that accounts[4] win after deducting comissin is correct 
        let winning = await lotteryInstance.checkWinningsAmount({from:accounts[4]})/1;
        const correctWinning = oneEth.dividedBy(1000).multipliedBy(18)/1;

        assert.strictEqual(
            winning,
            correctWinning,
            "Winning is Incorrect"
        )

    });



    //Test Restart Drwaing of Lottery
    it("Test Restart Draw", async() => {

        let buyTicket2 = await lotteryInstance.BuyTickets({from:accounts[1], value: 0.02 * oneEth});
        //Check that there are no purchases tickets.
        await truffleAssert.reverts(
            lotteryInstance.restartDraw(
                {from:accounts[0]}),
                "Cannot Restart Draw as Draw is in play"
        );
        
        //Make sure that there is no tickets before restarting the draw
        let drawTicket2 = await lotteryInstance.DrawWinnerTicket({from:accounts[0]});
        let restartDraw = await lotteryInstance.restartDraw({from:accounts[0]})

        //Check that the tickets has no purchased tickets after restarting
        let remainingTicket = await lotteryInstance.RemainingTickets({from:accounts[0]})/1;
  
        assert.strictEqual(
            remainingTicket,
            100,
            "There should be 100 tickets left to draw"
        )

    });



    //Test the WithdrawWinnings
    it("Test Withdraw Winnings", async() => {
        let withdraw = await lotteryInstance.WithdrawWinnings({from:accounts[1]});
        let isWinner2 = await lotteryInstance.IsWinner({from:accounts[1]});

        //Check that winning of accounts[1] goes back to 0 after claiming.
        assert.strictEqual(
            isWinner2,
            false,
            "Winning should be 0 after claiming"
        )
    });



    //Test RefundALl function after lottery has expired.
    it("Test Refund All", async() => {

        let buyTicket3 = await lotteryInstance.BuyTickets({from:accounts[5], value: 0.02 * oneEth});
        let buyTicket4 = await lotteryInstance.BuyTickets({from:accounts[6], value: 0.05 * oneEth});

        await truffleAssert.reverts(
            lotteryInstance.RefundAll(
                {from:accounts[0]}),
                "the lottery not expired yet" 
        )

        //Bring forward expiration time to call refundAll.
        let setExpiration = await lotteryInstance.setExpiration({from:accounts[0]});

        let refund = await lotteryInstance.RefundAll({from:accounts[0]});
        let remainingTicket2 = await lotteryInstance.RemainingTickets({from:accounts[0]})/1;
        assert.strictEqual(
            remainingTicket2,
            100,
            "Tickets are not set back to 100 after refundAll"
        )
    });



    //Test withdraw comission function
    it("Test Withdraw Comission", async() => {
        //Check that commision before and after withdraw comission is different.
        let commisionBefore = await lotteryInstance.getOperatorTotalCommission({from:accounts[0]});
        assert.notEqual(commisionBefore,
            0,
            "Comission in Contract should be more than 0"
        )

        let withdrawComission = await lotteryInstance.WithdrawCommission({from:accounts[0]});
        let comissinAfter = await lotteryInstance.getOperatorTotalCommission({from:accounts[0]})/1;
        
        assert.strictEqual(
            comissinAfter,
            0,
            "Comission in Contract should be 0"
        )
    })

});