const _deploy_contracts = require("../migrations/5_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');
const BigNumber = require('bignumber.js');
const oneEth = new BigNumber(1000000000000000000);

var WereWolf = artifacts.require("../contracts/WereWolf.sol");

contract('WereWolf', function(accounts) {
    before(async () => {
        wolfInstance= await WereWolf.deployed();
    });

    /*Test Start Game*/
    it("Test Start Game", async() => {

        /*Test that you cannot join a game that has not started*/
        await truffleAssert.reverts(
            wolfInstance.joinGame(
            {from:accounts[0]}),
            "The game has not yet started"
        );  

        /*Only creator of contract can start the game*/
        await truffleAssert.reverts(
            wolfInstance.startGame(5,5,
            {from:accounts[1]}),
            "Only the game creator can perform this action"
        );
            
        /*There must be more players than werewolves*/
        await truffleAssert.reverts(
            wolfInstance.startGame(5,5,
            {from:accounts[0]}),
            "There must be more players than werewolves"
        );

        /*Game must not have started before starting a new game the contract*/
        let startGame = await wolfInstance.startGame(8,5,{from:accounts[0]});                
        let numOfPLayers = await wolfInstance.getNumPlayers();  

        await truffleAssert.reverts(
            wolfInstance.startGame(8,5,
            {from:accounts[0]}),
            "The game has already started"
        );    

        /*Test that Event Game Started has been emitted*/
        truffleAssert.eventEmitted(startGame, 'GameStarted');

    });


    /*Test Join Game*/
    it("Test Join Game", async() => {
        let joinGame = await wolfInstance.joinGame({from:accounts[0]});

        /*Test one cannot join a game twice*/
        await truffleAssert.reverts(
            wolfInstance.joinGame(
            {from:accounts[0]}),
            "You have already joined the game"
        );  
        
        /*Test that Event PlayerJoined is emitted*/
        truffleAssert.eventEmitted(joinGame, 'PlayerJoined');

        /*Check that the player is registered in the players mapping*/
        truffleAssert.passes(
            await wolfInstance.joinGame({from: accounts[1],})
         );

        /*Check that number of player that is left to join has decreased*/
        let getNum1 = await wolfInstance.getNumPlayers()/1;
        assert.strictEqual(getNum1, 6, "Number of players needed for game to start is wrong.")


    });

    


});
