// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract TransferFunds {
    uint256 public transactionCount = 0;

    // an event to be emitted when a transfer occurs
    event TransferEvent(
        address from,
        address receiver,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    // a struct to store information about each transfer
    struct TransferFundsStruct {
        address sender;
        address receiver;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    TransferFundsStruct[] transactions; // an array to store all the transfers made

    // a function to add a new transfer to the blockchain
    function addDataToBlockchain(
        address payable receiver,
        uint256 amount,
        string memory message
    ) public {
        transactionCount += 1; // increment the transaction count
        // create a new TransferFundsStruct object and add it to the transactions array
        transactions.push(
            TransferFundsStruct(
                msg.sender,  // the sender's address
                receiver, // the receiver's address
                amount, // the amount being transferred
                message, // a message associated with the transfer 
                block.timestamp // the current timestamp
            )
        );

        // emit a TransferEvent to log the transfer
        emit TransferEvent(
            msg.sender,
            receiver,
            amount,
            message,
            block.timestamp
        );
    }

    // a function to get all the transfers made
    function getAllTransactions()
        public
        view
        returns (TransferFundsStruct[] memory)
    {
        return transactions;
    }

    // a function to get the number of transfers made
    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }


    /*Getter Function For Testing */
    function getSender(uint index) public view returns (address) {
        return transactions[index].sender;
    }

    function getReceiver(uint index) public view returns (address) {
        return transactions[index].receiver;
    }

    function getTranscationAmount(uint index) public view returns (uint256) {
        return transactions[index].amount;
    }

    function getMessage(uint index) public view returns (string memory) {
        return transactions[index].message;
    }

    function getTimeStamp(uint index) public view returns (uint256) {
        return transactions[index].timestamp;
    }


}