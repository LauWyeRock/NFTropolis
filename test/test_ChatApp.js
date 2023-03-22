const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require('truffle-assertions');
var assert = require('assert');

var chatAPP = artifacts.require("../contracts/ChatApp.sol");


contract('ChatApp', function(accounts) {
    before(async () => {
        chatInstance = await chatAPP.deployed();
    });


    //Create acount
    it("Test Create User Account", async() => {
        let accountInstance = await chatInstance.createAccount("John", {from:accounts[1]});
        

        
        //Test that A User Cannot Create Account more than once.
        await truffleAssert.reverts(
            chatInstance.createAccount("John", 
            {from:accounts[1]}),
            "User already exists"
        );

        //Check that name Entered cannot be an empty string.
        await truffleAssert.reverts(
                chatInstance.createAccount("",
                {from:accounts[2]}),
                "Username cannot be empty"
        );
        

    });



    //Check User function
    it("Test Check User Exists", async() => {
        let checkUser = await  chatInstance.checkUserExists(accounts[1],{from:accounts[1]});
        assert.strictEqual(checkUser, true, "Check User Function should return true.")


    });



    //Check Get Username Function
    it("Test Get Username", async() => {
            //Check that the user exist
            let getUserName1 = await chatInstance.getUsername(accounts[1],{from:accounts[1]});

            assert.strictEqual(
                "John",
                getUserName1,
                "User is not correct."
            );

            //Check that the user is registered
            await truffleAssert.reverts(
                chatInstance.getUsername(accounts[0],
                {from:accounts[0]}),
                "User is not registered"
        );


    });



    //Check that can add friend. Changes to contract.........
    it("Test Add Friend", async()=> {

        //accounts[0]:User that has not signed up an account.
        
        //Check that msg.sender has an account
        await truffleAssert.reverts(
            chatInstance.addFriend(accounts[2], "Friend_Name",
            {from:accounts[0]}),
            "Create an account first"
            
        );


        //Check that the friend is registered
        await truffleAssert.reverts(
            chatInstance.addFriend(accounts[0], "Friend_Name",
            {from:accounts[1]}),
            "User is not registered!"
            
        );
         
        //Check that msg.sender is not the same as friend adress
        await truffleAssert.reverts(
            chatInstance.addFriend(accounts[1],"Friend_Name",
            {from:accounts[1]}),
            "Users cannot add themeselves as friends"
            
        );



        let accountInstance2 = await chatInstance.createAccount("BrianLim", {from:accounts[2]});
        let addFriend = await chatInstance.addFriend(accounts[2], "BL",{from:accounts[1]});
         
        //Check whether msg.sender and friend is already friend.
        await truffleAssert.reverts(
            chatInstance.addFriend(accounts[2], "Friend_Name",
            {from:accounts[1]}),
            "These users are already friends"
            
        );
               
        //Finally Check whether they are really friends after successfull adding.
        let checkFriend = await chatInstance.checkAlreadyFriends(accounts[1],accounts[2], {from:accounts[1]});
        assert.strictEqual(checkFriend, true, "Two User should have been friends")


    });


    //Check that send message
    it("Test Send Message", async()=> {

        //Check that msg.sender has an account.
        await truffleAssert.reverts(
            chatInstance.sendMessage(accounts[1], "Message_Sent",
            {from:accounts[0]}),
            "Create an account first"
            
        );

        //Check that friend had an account.
        await truffleAssert.reverts(
            chatInstance.sendMessage(accounts[0], "Message_Sent",
            {from:accounts[1]}),
            "User is not registered"
            
        );

        //Check that whether msg.sender is currently friend with the friend.
        let accountInstance3 = await chatInstance.createAccount("LimMeng", {from:accounts[3]});
        await truffleAssert.reverts(
            chatInstance.sendMessage(accounts[3], "Message_Sent",
            {from:accounts[1]}),
            "You are not friend with the given user"
            
        );

        //Check that the message content is really correct.
        let sentMessage = await chatInstance.sendMessage(accounts[2],"Hi How Is Your Day?", {from:accounts[1]});
        let message = await chatInstance.readFirstMessage(accounts[1], {from:accounts[2]});
    
        assert.strictEqual(message, "Hi How Is Your Day?", "Message Content Is InCorrect!")

    });


});