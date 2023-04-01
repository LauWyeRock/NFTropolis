// SPDX-License-Identifier: GPL-3.0
import "@openzeppelin/contracts/utils/Strings.sol";

pragma solidity >=0.7.0 <0.9.0;

contract LotteryGame {
    uint256 public constant ticketPrice = 0.01 ether;
    uint256 public constant maxTickets = 100; // maximum tickets per lottery
    uint256 public constant ticketCommission = 0.001 ether; // commission per ticket
    uint256 public constant duration = 30 minutes; // The duration set for the lottery

    uint256 public expiration; // Timeout in case That the lottery was not carried out.
    address public lotteryOperator; // the creator of the lottery
    uint256 public operatorTotalCommission = 0; // the total commission balance
    address public lastWinner; // the last winner of the lottery
    uint256 public lastWinnerAmount; // the last winner amount of the lottery

    mapping(address => uint256) public winnings; // maps the winners to there winnings
    address[] public tickets; //array of purchased Tickets

    // modifier to check if caller is the lottery operator
    modifier isOperator() {
        require(
            (msg.sender == lotteryOperator),
            "Only the lottery operator can do this"
        );
        _;
    }

    // modifier to check if caller is a winner
    modifier isWinner() {
        require(IsWinner(), "Only the winner can do this");
        _; 
    }

    constructor() {
        lotteryOperator = msg.sender; // set the creator of the contract as the lottery operator
        expiration = block.timestamp + duration; // set the expiration time for the lottery
    }

    // return all the tickets
    function getTickets() public view returns (address[] memory) {
        return tickets;
    }

    function getWinningsForAddress(address addr) public view returns (uint256) {
        return winnings[addr];
    }

    function BuyTickets() public payable {
        require(
            msg.value % ticketPrice == 0,
            "the value must be multiple of 0.01 Ether"
            // string.concat(
            //     "the value must be multiple of ",
            //     Strings.toString(ticketPrice),
            //     " Ether"
            // )
        );
        uint256 numOfTicketsToBuy = msg.value / ticketPrice;

        require(
            numOfTicketsToBuy <= RemainingTickets(),
            "Not enough tickets available."
        );

        for (uint256 i = 0; i < numOfTicketsToBuy; i++) {
            tickets.push(msg.sender);
        }
    }

    function DrawWinnerTicket() public {
        require(tickets.length > 0, "No tickets were purchased");

        // generate a random number to select the winner ticket
        bytes32 blockHash = blockhash(block.number - tickets.length);
        uint256 randomNumber = uint256(
            keccak256(abi.encodePacked(block.timestamp, blockHash))
        );
        uint256 winningTicket = randomNumber % tickets.length;

        // select the winner and update relevant variables
        address winner = tickets[winningTicket];
        lastWinner = winner;
        winnings[winner] += (tickets.length * (ticketPrice - ticketCommission));
        lastWinnerAmount = winnings[winner];
        operatorTotalCommission += (tickets.length * ticketCommission);
        delete tickets;  // clear the array of purchased tickets
        expiration = block.timestamp + duration; // reset the expiration time for the lottery
    }

    function restartDraw() public {
        require(tickets.length == 0, "Cannot Restart Draw as Draw is in play");

        delete tickets;
        expiration = block.timestamp + duration;
    }

    function checkWinningsAmount() public view returns (uint256) {
        address payable winner = payable(msg.sender);

        // Get the winnings amount for the caller
        uint256 reward2Transfer = winnings[winner];

        return reward2Transfer;
    }

    function WithdrawWinnings() public isWinner {
        address payable winner = payable(msg.sender);

        // Get the winnings amount for the caller
        uint256 reward2Transfer = winnings[winner];

        // Set the winnings amount for the caller to 0
        winnings[winner] = 0;

        // Transfer the winnings amount to the caller's address
        winner.transfer(reward2Transfer);
    }

    function RefundAll() public {
        require(block.timestamp >= expiration, "the lottery not expired yet");

        // Iterate through all the purchased tickets
        for (uint256 i = 0; i < tickets.length; i++) {
            address payable to = payable(tickets[i]);
            // Clear the ticket from the array
            tickets[i] = address(0);
            // Refund the ticket price to the original buyer
            to.transfer(ticketPrice);
        }
        // Clear the tickets array
        delete tickets;
    }

    function WithdrawCommission() public isOperator {
        address payable operator = payable(msg.sender);

        // Get the commission amount to transfer to the operator
        uint256 commission2Transfer = operatorTotalCommission;

        // Set the commission balance to 0
        operatorTotalCommission = 0;

        // Transfer the commission amount to the operator's address
        operator.transfer(commission2Transfer);
    }

    function IsWinner() public view returns (bool) {
        // Check if the caller is a winner based on their winnings amount
        return winnings[msg.sender] > 0;
    } 

    function CurrentWinningReward() public view returns (uint256) {
        // Get the current winning reward, which is the total value of all purchased tickets
        return tickets.length * ticketPrice;
    }

    function RemainingTickets() public view returns (uint256) {
         // Get the number of remaining tickets available for purchase
        return maxTickets - tickets.length;
    }

    function setExpiration() public isOperator {
        expiration = block.timestamp;
    }

    function getOperatorTotalCommission() public view returns (uint256){
        return operatorTotalCommission;
    }
}
