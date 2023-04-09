const _deploy_contracts = require("../migrations/7_deploy_contracts");
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');
const oneEth = new BigNumber(1000000000000000000);

var assert = require('assert');
const { ethers } = require("ethers");

var vote = artifacts.require("../contracts/Voting.sol");

contract('Voting', function(accounts) {
    before(async () => {
        voteInstance = await vote.deployed();
    });


    /*Test creating a voting propsal works.*/
    it("Test Create Proposal", async() => {
        const question = "This is a new proposal";
        const expirationDate = 1780802025


        /*Check that only the creator of contract create a proposal*/
        await truffleAssert.reverts(
            voteInstance.createProposal(
                question,
                expirationDate,
                {from:accounts[1]}),
                "Only the owner can perform this action"
        );
        

        /*Check that event is emitted*/
        let firstProposal = await voteInstance.createProposal(question, expirationDate, {from:accounts[0]});
        truffleAssert.eventEmitted(firstProposal, 'ProposalCreated')
    

        /*Check all the voting details are correct*/
        const proposal = await voteInstance.getProposalDetails(0);

        assert.equal(proposal.question, question, "Question should match");
        assert.equal(proposal.expirationDate.toNumber(), expirationDate, "Expiration date should match");
        assert.equal(proposal.yesVotes, 0, "Yes votes should be 0");
        assert.equal(proposal.noVotes, 0, "No votes should be 0");

    });



    /*Test Commit Vote*/
    it("Test Commit Vote", async() => {

        /*Createing a commitment for voting*/
        const commitment = "0x0d62c63fa7e73979b8cec5b0ca820e1bb99390d3a2f1472c6f6ef2b51a8dcf4f";
        const proposalD = 0;
        let commitVote = await voteInstance.commitVote(proposalD, commitment, {from:accounts[1]});


        /*Get the latest block timestamp*/
        const block = await web3.eth.getBlock("latest");
        const blockTimestamp = block.timestamp;
        console.log("Block timestamp:", blockTimestamp);
        

        /*Check that an vote committed event is emitted*/
        truffleAssert.eventEmitted(commitVote , 'VoteCommitted')


        /*Check that the commitment is correc*/
        const getCommitment = await voteInstance.getVoterCommitment(proposalD, {from:accounts[1]}); 
        assert.equal(getCommitment, commitment, "Commitment is different.")


        /*Check that there cannot be repeated commitment*/
        await truffleAssert.reverts(
            voteInstance.commitVote(
                proposalD,
                commitment,
                {from:accounts[1]}),
                "Commitment already used"
        );


        /*Check that voting has not expired*/
        const question = "This is a new proposal";
        const expirationDate = 1280802025
        const commitment2 = "0x51520c91e6b94f6d8e36b9cfa20fd87da19d0ebea54fd37a0d3c3cb0b7a8a4e4";
        const proposalD2 = 1;
        let expiredProposal = await voteInstance.createProposal(question, expirationDate, {from:accounts[0]});
  
        await truffleAssert.reverts(
            voteInstance.commitVote(
                proposalD2,
                commitment2,
                {from:accounts[1]}),
                "Voting has expired"
        );


        /*Check that a user cannot vote more than twice*/
        await truffleAssert.reverts(
            voteInstance.commitVote(
                proposalD,
                commitment2,
                {from:accounts[1]}),
                "User already voted"
        );


    });


    /*Test Set Quorum */
    it("Test Set Quorum", async() => {

        /*Check that only the owner can set the minimum quorum percentage*/
        await truffleAssert.reverts(
            voteInstance.setMinQuorumPercentage(
                10,
                {from:accounts[1]}),
                "Only the owner can set the minimum quorum percentage"
        );
        

        /*Check that only the owner can set the minimum quorum votes*/
        await truffleAssert.reverts(
            voteInstance.setMinQuorumVotes(
                5,
                {from:accounts[1]}),
                "Only the owner can set the minimum quorum votes"
        );


    });


    /*Test Reveal Vote*/
    it("Test Reveal Proposal and Pass Proposal", async() => {
        
        const proposalD = 0;
        const vote = true;
        const secret = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        /*Check that a the commitment must be valid by supplying a false secret*/
        const falseSecret = "0x0321456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

        await truffleAssert.reverts(
            voteInstance.revealVote(
                proposalD,
                vote,
                falseSecret,
                {from:accounts[1]}),
                "Invalid commitment"
        );



        /*Check that a the commitment cannot be revealed in advance*/
        await truffleAssert.reverts(
            voteInstance.revealVote(
                proposalD,
                vote,
                secret,
                {from:accounts[1]}),
                "Voting has not yet expired"
        );



        /*Check that an vote committed event is emitted by delaying the block timestamp*/
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

        let reveal = await voteInstance.revealVote(proposalD, vote, secret, {from:accounts[1]});
        truffleAssert.eventEmitted(reveal , 'VoteRevealed')


        /*Check that a voter cannot reveal his vote more than once*/
        await truffleAssert.reverts(
            voteInstance.revealVote(
                proposalD,
                vote,
                secret,
                {from:accounts[1]}),
                "Vote already revealed"
        );


        /*Check that there is only one yes Vote*/
        const proposal = await voteInstance.getProposalDetails(0);
        assert.equal(proposal.yesVotes, 1, "Yes Votes should have been 1");


        /*Check that Proposal is not Passed, if it dosnot meet the minimum quorum votes.*/
        let getResult = await voteInstance.isProposalPassed(proposalD);
        assert.equal(getResult, false, "Proposal should not been passed.") 


        /*Set a minimum quorum tot test the proposal can pass*/
        const minQuorumVotes = 0;
        let setMinQuorum = await voteInstance.setMinQuorumVotes(minQuorumVotes, {from:accounts[0]});
        let getResult2 = await voteInstance.isProposalPassed(proposalD);
        assert.equal(getResult2, true, "Proposal should have passed.");

    });



});

