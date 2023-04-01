const _deploy_contracts = require("../migrations/6_deploy_contracts");
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');
const oneEth = new BigNumber(1000000000000000000);

var assert = require('assert');
const { ethers } = require("ethers");

var transfer = artifacts.require("../contracts/TransferFunds.sol");

contract('TransferFunds', function(accounts) {
    before(async () => {
        transferInstance= await transfer.deployed();
    });

        /*Test Transfer Funds*/
        it("Test Transfer", async() => {
            let transfer1  = await transferInstance.addDataToBlockchain(
                accounts[1],
                oneEth, 
                "Hello",
                {from:accounts[0]}    
            );

            /*Test transfer event is emitted*/
            truffleAssert.eventEmitted(transfer1 , 'TransferEvent');


            /*Check that the transcation count increases*/
            let transcationCount = await transferInstance.getTransactionCount()/1;
            

            assert.strictEqual(
                transcationCount,
                1,
                "Total Transcation Recorded should be 1"
            )

            /*Check that the sender is correct*/
            let getSender = await transferInstance.getSender(0);

            assert.strictEqual(
                getSender,
                accounts[0],
                "Sender address is not right"
            )


            /*Check that the receiver is correct*/
            let getReceiver = await transferInstance.getReceiver(0);
                
            assert.strictEqual(
                getReceiver,
                accounts[1],
                "Receiver address is not right"
            )

            /*Check that the transfer amount is right*/
            let transactAmount = await transferInstance.getTranscationAmount(0)/1;
            

            assert.strictEqual(
                transactAmount,
                1000000000000000000,
                "Transcation Amount is incorrect"
            )

            /*Check that the message is correct*/
            let message = await transferInstance.getMessage(0);
            assert.strictEqual(
                message,
                "Hello",
                "Transcation Message is Incorrect."
            )


            /*Check that the time stamp is correct*/
            const blockNumber = await web3.eth.getBlockNumber();
            const block = await web3.eth.getBlock(blockNumber);
            const blockTimestamp = block.timestamp;
            
            let getTimeStamp = await transferInstance.getTimeStamp(0)/1;

            assert.strictEqual(
                getTimeStamp,
                blockTimestamp,
                "Block Time Stamp is incorrect"
            )

            
            /*Check that the transcation incremented correctly after another transcation is called*/
            let transfer2  = await transferInstance.addDataToBlockchain(
                accounts[0],
                oneEth, 
                "This is the Second Transcation",
                {from:accounts[1]}    
            );

            let transcationCount2 = await transferInstance.getTransactionCount()/1;

            assert.strictEqual(
                transcationCount2,
                2,
                "Total Transcation Recorded should be 2"
            )
        });


        












});