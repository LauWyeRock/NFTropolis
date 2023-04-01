// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Voting {
    // Struct to store details of each proposal
    struct Proposal {
        string question; // The question being voted on
        uint256 yesVotes; // Number of "Yes" votes
        uint256 noVotes; // Number of "No" votes
        uint256 expirationDate; // Expiration date of the voting period
        mapping(address => bytes32) commitments; // Hash of voter's secret vote
        mapping(address => bool) hasRevealed; // Whether a voter has revealed their vote
        mapping(bytes32 => bool) uniqueCommitments;  // To ensure each commitment is unique
        mapping(address => bool) voted; // To prevent users from voting multiple times
    }

    address public owner; // Address of the contract owner
    mapping(uint256 => Proposal) public proposals; // Mapping of proposal IDs to their corresponding Proposal struct
    uint256 public numProposals; // Number of proposals that have been created

    uint256 public minQuorumPercentage; // Minimum quorum percentage required for a proposal to be valid
    uint256 public minQuorumVotes;  // Minimum number of votes required for a proposal to be valid

    // Event emitted when a proposal is created
    event ProposalCreated(uint256 indexed proposalId, string question, uint256 expirationDate);
    // Event emitted when a voter commits their vote
    event VoteCommitted(uint256 indexed proposalId, address indexed voter);
    // Event emitted when a voter reveals their vote
    event VoteRevealed(uint256 indexed proposalId, address indexed voter, bool vote);
    // Event emitted when the minimum quorum percentage is updated
    event MinQuorumPercentageUpdated(uint256 newMinQuorumPercentage);
    // Event emitted when the minimum quorum votes are updated
    event MinQuorumVotesUpdated(uint256 newMinQuorumVotes);

    // Modifier to ensure only the contract owner can perform an action
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Modifier to ensure a voter has not voted before
    modifier notVotedBefore(uint256 _proposalId) {
        require(!proposals[_proposalId].voted[msg.sender], "User has already voted");
        _;
    }

    // Modifier to ensure the minimum quorum percentage is met
    modifier meetsMinQuorumPercentage(uint256 _proposalId) {
        uint256 quorum = getQuorum(_proposalId);
        require(quorum >= minQuorumPercentage, "Minimum quorum percentage not met");
        _;
    }

    // Modifier to ensure the minimum quorum votes are met
    modifier meetsMinQuorumVotes(uint256 _proposalId) {
        uint256 totalVotes = proposals[_proposalId].yesVotes + proposals[_proposalId].noVotes;
        require(totalVotes >= minQuorumVotes, "Minimum quorum votes not met");
        _;
    }

    // Constructor to set the initial values for minimum quorum percentage and votes
    constructor() {
        owner = msg.sender;
        minQuorumPercentage = 30;
        minQuorumVotes = 1;
    }

    
    // Function to create a new proposal
    function createProposal(string memory _question, uint256 _expirationDate) onlyOwner public returns (uint256 proposalId) {
        // require(msg.sender == owner, "Only the owner can create proposals");
        proposalId = numProposals++; // Generate a unique ID for the proposal
        Proposal storage p = proposals[proposalId]; // Create a new Proposal struct for the given ID
        // Set the question and expiration date for the proposal
        p.question = _question;
        p.expirationDate = _expirationDate;

        // Emit an event to notify listeners that a new proposal has been created
        emit ProposalCreated(proposalId, _question, _expirationDate);
    }

    function commitVote(uint256 _proposalId, bytes32 _commitment) public {
        Proposal storage p = proposals[_proposalId]; // Get the proposal struct for the given ID
        require(p.uniqueCommitments[_commitment] == false, "Commitment already used"); // Ensure that the commitment has not been used before
        require(block.timestamp < p.expirationDate, "Voting has expired"); // Ensure that voting has not yet expired
        require(!p.voted[msg.sender], "User already voted"); // Ensure that the user has not already voted
        p.commitments[msg.sender] = _commitment; // Save the commitment for the user
        p.uniqueCommitments[_commitment] = true; // Mark the commitment as used
        p.voted[msg.sender] = true; // Mark the user as having voted

        // Emit an event to notify listeners that a new vote has been committed
        emit VoteCommitted(_proposalId, msg.sender);
    }

    function revealVote(uint256 _proposalId, bool _vote, bytes32 _secret) public {
        Proposal storage p = proposals[_proposalId]; // Get the proposal struct for the given ID
        bytes32 commitment = keccak256(abi.encodePacked(msg.sender, _vote, _secret));  // Calculate the commitment for the given vote and secret
        require(commitment == p.commitments[msg.sender], "Invalid commitment"); // Ensure that the given commitment matches the saved commitment for the user
        require(!p.hasRevealed[msg.sender], "Vote already revealed"); // Ensure that the user has not already revealed their vote
        require(block.timestamp >= p.expirationDate, "Voting has not yet expired"); // Ensure that voting has expired

        // Update the vote counts based on the revealed vote
        if (_vote) {
            p.yesVotes++;
        } else {
            p.noVotes++;
        }
        p.hasRevealed[msg.sender] = true;

        // Emit an event to notify listeners that a vote has been revealed
        emit VoteRevealed(_proposalId, msg.sender, _vote);
    }

    function getProposalDetails(uint256 _proposalId) public view returns (string memory question, uint256 yesVotes, uint256 noVotes, uint256 expirationDate) {
        Proposal storage p = proposals[_proposalId];

        // Retrieve the relevant details from the proposal struct
        question = p.question;
        yesVotes = p.yesVotes;
        noVotes = p.noVotes;
        expirationDate = p.expirationDate;
    }

    //Returns the commitment hash for a voter on a proposal.
    function getVoterCommitment(uint256 _proposalId) public view returns (bytes32) {
        Proposal storage p = proposals[_proposalId];
        return p.commitments[msg.sender];
    }

    function getVoterVote(uint256 _proposalId) public returns (bool) {
        Proposal storage p = proposals[_proposalId];
        require(p.hasRevealed[msg.sender], "Vote not yet revealed");
        bytes32 commitment = p.commitments[msg.sender];
        // If the hash of the commitment matches the hash of a "yes" vote, return true, else return false.
        bool vote = commitment == keccak256(abi.encodePacked(msg.sender, true, ""));

        // Emit a VoteRevealed event.
        emit VoteRevealed(_proposalId, msg.sender, vote);

        return vote;
        
    }

    function setMinQuorumPercentage(uint256 _minQuorumPercentage) public {
        require(msg.sender == owner, "Only the owner can set the minimum quorum percentage");
        minQuorumPercentage = _minQuorumPercentage;
        emit MinQuorumPercentageUpdated(minQuorumPercentage);
    }

    function setMinQuorumVotes(uint256 _minQuorumVotes) public {
        require(msg.sender == owner, "Only the owner can set the minimum quorum votes");
        minQuorumVotes = _minQuorumVotes;
        emit MinQuorumVotesUpdated(minQuorumVotes);
    }

    function getQuorum(uint256 _proposalId) public view returns (uint256) {
        Proposal storage p = proposals[_proposalId];
        uint256 totalVotes = p.yesVotes + p.noVotes;
        uint256 quorum = totalVotes * 100 / (minQuorumPercentage * 1 ether);
        return quorum;
    }

    function isProposalPassed(uint256 _proposalId) public view returns (bool) {
        Proposal storage p = proposals[_proposalId];
        uint256 quorum = getQuorum(_proposalId);
        return (quorum >= minQuorumVotes && p.yesVotes > p.noVotes);
    }
}