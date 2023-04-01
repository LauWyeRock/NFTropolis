// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract TransferFunds {
    uint256 public transactionCount = 0;

    event TransferEvent(
        address from,
        address receiver,
        uint256 amount,
        string message,
        uint256 timestamp
    );

    struct TransferFundsStruct {
        address sender;
        address receiver;
        uint256 amount;
        string message;
        uint256 timestamp;
    }

    TransferFundsStruct[] transactions;

    function addDataToBlockchain(
        address payable receiver,
        uint256 amount,
        string memory message
    ) public {
        transactionCount += 1;
        transactions.push(
            TransferFundsStruct(
                msg.sender,
                receiver,
                amount,
                message,
                block.timestamp
            )
        );

        emit TransferEvent(
            msg.sender,
            receiver,
            amount,
            message,
            block.timestamp
        );
    }

    function getAllTransactions()
        public
        view
        returns (TransferFundsStruct[] memory)
    {
        return transactions;
    }

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