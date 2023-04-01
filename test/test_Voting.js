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

    /*Test Set Candidate Work*/

    it("Test Set Candidate", async() => {

        /*Only the creator of contract can set the candidate*/
        await truffleAssert.reverts(
            voteInstance.setCandidate(
                accounts[1],
                "18",
                "John Doe",
                "image.png",
                "QmSomeIpfsHash",
                {from:accounts[1]}),
                "You have no azuthorization to set Candidate" 
            );
        
        
        /*Check Candidate Create Event is emitted*/
        let setCandidate = await voteInstance.setCandidate(
                accounts[1],
                "18",
                "John Doe",
                "image.png",
                "QmSomeIpfsHash",
                {from:accounts[0]});


        /* Check that the CandidateCreate event is emitted*/
        truffleAssert.eventEmitted(setCandidate, "CandidateCreate", (event) => {
            // Extract the candidateId from the event
            const candidateId = event.candidateId.toNumber();
    
            /* Test that the candidateId is correctly set*/
            return candidateId === 1;
        }, "Candidate ID should be 1");


        /*Check that candidateAddress length is correct*/
        let candidateLength  =  await voteInstance.getCandidateLength({from:accounts[0]})/1;
        assert.strictEqual(
            candidateLength,
            1,
            "Candidate Address Length is incorrect"
        )


        /*Check that the infromation in the candidate struct in the mapping is correct*/
        let candidateData = await voteInstance.getCandidateData(accounts[1]);

        const candidateAddress = accounts[1];
        const candidateAge = "18";
        const candidateName = "John Doe";
        const candidateImage = "image.png";
        const candidateIpfs = "QmSomeIpfsHash";

        //Check the returned data
        assert.equal(candidateData[0], candidateAge, "Candidate age should match");
        assert.equal(candidateData[1], candidateName, "Candidate name should match");
        assert.equal(candidateData[2].toNumber(), 1, "Candidate ID should be 1");
        assert.equal(candidateData[3], candidateImage, "Candidate image should match");
        assert.equal(candidateData[4].toNumber(), 0, "Candidate vote count should be 0");
        assert.equal(candidateData[5], candidateIpfs, "Candidate IPFS hash should match");
        assert.equal(candidateData[6], candidateAddress, "Candidate address should match");

    });

    /*Test Authroization to Vote Workd*/
    it("Test Set Authorisation", async() => {

        /*Check that only organiser can give authorisation to someone to vote*/
        await truffleAssert.reverts(
            voteInstance.voterRight(
                accounts[2],
                "Jane Smith",
                "jane_smith.png",
                "QmAnotherIpfsHash",
                {from:accounts[1]}),
                "You have no right to provide authorization for vote"
        );

        /*Check that vote event is emitted*/
        let setVoterRight = await voteInstance.voterRight(
                accounts[2],
                "Jane Smith",
                "jane_smith.png",
                "QmAnotherIpfsHash",
                {from:accounts[0]});

        truffleAssert.eventEmitted(setVoterRight,"VoterCreated");
        

        /*Check that you cannot give someone vote authroisation more than once*/
        await truffleAssert.reverts(
            voteInstance.voterRight(
                accounts[2],
                "Jane Smith",
                "jane_smith.png",
                "QmAnotherIpfsHash",
                {from:accounts[0]}),
                "Vote authorisation given before"
        );


    });












});

