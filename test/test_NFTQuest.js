const RPGToken = artifacts.require("RPGToken");
const nftQuest = artifacts.require("nftQuest");
const BigNumber = require('bignumber.js');

const oneEth = new BigNumber(1000000000000000000);
const truffleAssert = require("truffle-assertions");

contract("nftQuest", (accounts) => {
    let rpgTokenInstance, nftQuestInstance;

    beforeEach(async () => {
        rpgTokenInstance = await RPGToken.new(1000000000000);
        nftQuestInstance = await nftQuest.new(rpgTokenInstance.address);
    });


    /*Test that a NFT character can be minded successfully*/
    it("Test Minting Charcter", async () => {

        /*Test minimum of 0.1 eth is needed to mint*/
        await truffleAssert.reverts(
            nftQuestInstance.mint("New Character", {
            from: accounts[1],
            value: 0,
            }),
            "at least 0.1 ETH is needed to mint a new character"
        );
            

        /*Check that the initial attack value of the NFT character is between 1 to 20*/
        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await nftQuestInstance.mint("New Character", { value: oneEth, from: accounts[0] });
        const character = await nftQuestInstance.characters(0);
        const finalBalance = await web3.eth.getBalance(accounts[0]);

        assert.equal(character.name, "New Character", "Character name is not correct");
        assert.isAtLeast(parseInt(character.attk), 0, "Character attack is not generated correctly");
        assert.isAtMost(parseInt(character.attk), 20, "Character attack is not generated correctly");


        /*Check that refund function operates correct meaning only 0.1 eth is needed to mint accounting for gas fee*/
        assert.isAtMost(parseInt(initialBalance - finalBalance), 101000000000000000, "Refunded eth is incorrect");


    });


    /*Test the fighting mechanism is working as intended*/
    it("Test Fight", async () => {
        await nftQuestInstance.mint("New Character", { value: oneEth, from: accounts[0] });
        const initialBalance = await nftQuestInstance.getRPGBalance(accounts[0]);

        /*Check that only owner can fight put his monster to fight*/
        await truffleAssert.reverts(
            nftQuestInstance.fightMonsters(0, {
            from: accounts[1],
            }),
        );

        /*Check that a valid CharacterID has to be provided to start a fight*/
        await truffleAssert.reverts(
            nftQuestInstance.fightMonsters(10, {
            from: accounts[0],
            }),
        );


        /*Issuing token to account[0] & and the contract*/
        let issue = await rpgTokenInstance.issueToken({from: accounts[0]});
        let issue2 = await rpgTokenInstance.issueTo(nftQuestInstance.address);    

        
        /*Test that fight is conducted and the reward is credited */
        const result = await nftQuestInstance.fightMonsters(0, { from: accounts[0] });

        truffleAssert.eventEmitted(result, "monsterFightCompleted", (event) => {
        if (event.status === "Win") {
            assert.equal(parseInt(event.rewards), 1, "Rewards are not correct");
            return true;
        } else {
            assert.equal(parseInt(event.rewards), 0, "Rewards are not correct");
            return true;
        }
        });


        /*Test that fight is conducted and the experience is credited */
        const finalBalance = await nftQuestInstance.getRPGBalance(accounts[0]);
        const rewards = parseInt(finalBalance) - parseInt(initialBalance);

        if (rewards === 0) {
        const character = await nftQuestInstance.characters(0);
        assert.equal(parseInt(character.exp), 0, "Character experience is not correct");
        } else {
        const character = await nftQuestInstance.characters(0);
        assert.equal(parseInt(character.exp), 50, "Character experience is not correct");
        }
    });


    /*Test Level Up and Exprience Logic*/
    it("Test Level Up and Experience Threshold", async () => {
        let issue = await rpgTokenInstance.issueToken({from: accounts[0]});
        let issue2 = await rpgTokenInstance.issueTo(nftQuestInstance.address); 
        await nftQuestInstance.mint("New Character", { value: oneEth, from: accounts[0] });

        for (let i = 0; i < 5; i++) {
            await nftQuestInstance.fightMonsters(0, { from: accounts[0] });
        }

        const character = await nftQuestInstance.characters(0);
        const currentLevel = parseInt(character.level);
        assert.isAtLeast(currentLevel, 2, "Character level should be at least 2 after gaining enough experience");


        /*Check if the experience has increased*/
        const currentExp = parseInt(character.exp);
        assert.isAtLeast(currentExp, 0, "Character experience should be reset or increased after leveling up"); 
        });

});