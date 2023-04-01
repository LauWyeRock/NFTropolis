
// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract ChatApp{

    //USER STRUCT
    struct user{
        string name;
        friend[] friendList;
    }

    struct friend{
        address pubkey;
        string name;
    }

    struct message{
        address sender;
        uint256 timestamp;
        string msg;
    }

    struct AllUserStruct{
        string name;
        address accountAddress;
    }

    AllUserStruct[] getAllUsers; // list of all registered users

    mapping(address => user) userList;  // map of all registered users
    mapping(bytes32 => message[]) allMessages; // map of messages between users

    //CHECK USER EXIST
    function checkUserExists(address pubkey) public view returns(bool) {
        // Check if the user with the given address exists or not
        return bytes(userList[pubkey].name).length > 0;
    }

    //CREATE ACCOUNT
    function createAccount(string calldata name) external {
        // Create an account with the given username
        // The account is created using the address of the sender
        require(checkUserExists(msg.sender) == false, "User already exists"); // Check if the user already exists
        require(bytes(name).length> 0, "Username cannot be empty"); // Check if the username is not empty

        userList[msg.sender].name = name; // Add the username to the user list

        getAllUsers.push(AllUserStruct(name, msg.sender)); // Add the user to the list of all registered users
    }

    //GET USERNAME
    function getUsername(address pubkey) external view returns(string memory){
        // Get the username of the user with the given address
        require(checkUserExists(pubkey), "User is not registered"); // Check if the user exists
        return userList[pubkey].name; // Return the username
    }

    //ADD FRIENDS
    function addFriend(address friend_key, string calldata name) external{
        // Add a friend to the friend list of the user with the given address
        require(checkUserExists(msg.sender), "Create an account first"); // Check if the user exists
        require(checkUserExists(friend_key), "User is not registered!");// Check if the friend exists
        require(msg.sender != friend_key, "Users cannot add themeselves as friends"); // Check if the user is not adding themselves as friend
        require(checkAlreadyFriends(msg.sender, friend_key)== false, "These users are already friends");// Check if the users are not already friends

        _addFriend(msg.sender, friend_key, name);  // Add the friend to the user's friend list
        _addFriend(friend_key, msg.sender, userList[msg.sender].name); // Add the user to the friend's friend list
    }

    //checkAlreadyFriends
    function checkAlreadyFriends(address pubkey1, address pubkey2) public view returns (bool){
        // Check if the given two users are already friends or not
        if(userList[pubkey1].friendList.length > userList[pubkey2].friendList.length){
            address tmp = pubkey1;
            pubkey1 = pubkey2;
            pubkey2 = tmp;
        }

        for(uint256 i = 0; i < userList[pubkey1].friendList.length; i++){
            
            if(userList[pubkey1].friendList[i].pubkey == pubkey2) return true;
        }
        return false;
    }

    function _addFriend(address me, address friend_key, string memory name) internal{
        // Add a friend to the user's friend list
        friend memory newFriend = friend(friend_key, name);
        userList[me].friendList.push(newFriend);
    }

    //GETMY FRIEND
    function getMyFriendList() external view returns(friend[] memory){
        // This function returns an array of friend structs, representing the friends of the caller
        return userList[msg.sender].friendList;
    }

    //get chat code
    function _getChatCode(address pubkey1, address pubkey2) internal pure returns(bytes32){ 
        // returns a bytes32 value representing a unique identifier for the chat between the two users
        if(pubkey1 < pubkey2){
            return keccak256(abi.encodePacked(pubkey1, pubkey2));
        } else 
        return keccak256(abi.encodePacked(pubkey2, pubkey1));
    }

    //SEND MESSAGE
    function sendMessage(address friend_key, string calldata _msg) external{
        require(checkUserExists(msg.sender), "Create an account first");
        require(checkUserExists(friend_key), "User is not registered");
        require(checkAlreadyFriends(msg.sender, friend_key), "You are not friend with the given user");

        // adds the message to the chat history between the caller and the friend
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        message memory newMsg = message(msg.sender, block.timestamp, _msg);
        allMessages[chatCode].push(newMsg);
    }

    //READ MESSAGE
    function readMessage(address friend_key) external view returns(message[] memory){
        // returns an array of message structs representing the chat history between the caller and the friend. 
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        return allMessages[chatCode];
    }

    function getAllAppUser() public view returns(AllUserStruct[] memory){
        return getAllUsers;
    }

    function readFirstMessage(address friend_key) external view returns(string memory){
        bytes32 chatCode = _getChatCode(msg.sender, friend_key);
        return allMessages[chatCode][0].msg;
    }
}