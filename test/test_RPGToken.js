const RPGToken = artifacts.require("RPGToken");
const truffleAssert = require('truffle-assertions');

contract("RPGToken", (accounts) => {

    const owner = accounts[0];
    const initialSupply = 5000000; // Adjust this value based on your desired initial supply
    const issueAmount = 100000;
    let rpgTokenInstance;

    before(async () => {
        rpgTokenInstance = await RPGToken.new(initialSupply, { from: owner });
    });

    /*Check that Name and Token of the Token is correct*/
    it("Correct Name and Symbol for RPGToken", async () => {
        const name = await rpgTokenInstance.name();
        const symbol = await rpgTokenInstance.symbol();

        assert.equal(name, "RPGToken", "Token name should be 'RPGToken'");
        assert.equal(symbol, "RPG", "Token symbol should be 'RPG'");
    });


    /*Check that the initial supply is correct*/
    it("Correct Initial Supply", async () => {
        const remainingSupply = await rpgTokenInstance.getCurrentSupply();
        assert.equal(remainingSupply, initialSupply.toString(), "Initial supply should match the specified value");
    });


    /*Check that issuing token decreases the remaining supply*/
    it("Correct Issue Token", async () => {
        // Issue tokens
        await rpgTokenInstance.issueToken({ from: owner });

        // Check owner's balance
        const ownerBalance = await rpgTokenInstance.balanceOf(owner);
        assert.equal(ownerBalance.toString(), issueAmount.toString(), "Owner's balance should be increased by the issued amount");

        // Check remaining supply
        const remainingSupply = await rpgTokenInstance.getCurrentSupply();
        assert.equal(remainingSupply.toString(), (initialSupply - issueAmount).toString(), "Remaining supply should decrease by the issued amount");
    });


    /*Check that only owners can issue token*/
    it("Correct Token Issue", async () => {
        const nonOwner = accounts[1];

        await truffleAssert.reverts(
            rpgTokenInstance.issueToken({ from: nonOwner }),
            "Ownable: caller is not the owner"
        );
    });

    
    /*Check that we can no longer issue any more token once max supply is surpass*/
    it("Correct Handling of Max Supply", async () => {

        // Issue tokens until max supply is reached
        let remainingSupply2 = await rpgTokenInstance.getCurrentSupply();
        const iterations = remainingSupply2 / issueAmount;

        for (let i = 0; i < iterations; i++) {
            await rpgTokenInstance.issueToken({ from: owner });
        }

        await truffleAssert.reverts(
            rpgTokenInstance.issueToken({ from: owner }),
            "Max Supply Reached"
        );
    });
});