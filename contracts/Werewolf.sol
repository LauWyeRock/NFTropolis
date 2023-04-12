// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './ERC20.sol';

contract Werewolf {
    // -------------------------------------
    // State machine section starts
    // -------------------------------------
    enum Stages {
        NightTimeWerewolf,
        DayTime
    }

    Stages public stage = Stages.NightTimeWerewolf;

    modifier atStage(Stages _stage) {
        require(stage == _stage, "Stage is wrong");
        _;
    }

    function nextStage() internal {
        stage = Stages((uint(stage) + 1) % 2);
    }
    
    // -------------------------------------
    // State machine section ends
    // -------------------------------------

    enum Roles {
        werewolf, 
        villager,
        seer
    }

    Roles[] private defaultPlayerRoles = [
        Roles.werewolf,
        Roles.villager,
        Roles.villager,
        Roles.villager,
        Roles.seer
    ];
    Roles[] private remainingPlayerRoles;

    address public gameCreator;
    uint private voteCount; 
    uint private playersCount; 
    uint private villagerCount; 
    uint private werewolfCount; 
    uint private seerCount; 
    uint public aliveVillagerCount; 
    uint private alivePlayerCount; 

    address payable[] public playerList;
    mapping (address => bool) private hasVoted;
    mapping (address => uint) private playerVotedCount;

    mapping (address => bool) private isWerewolfMapping;
    mapping (address => bool) private isVillagerMapping;
    mapping (address => bool) private isSeerMapping;
    mapping (address => bool) private isDeadMapping;
    mapping (address => bool) private isPlayerMapping;

    event giveWinningsToWerewolf();
    event giveWinningsToNonWerewolf();
    event SeerIdentifiedWerewolf();

    event NightStarted();
    event DayStarted();

    event GameEnded(string description);
    event GameStarted();

    event PlayerJoined(address player);
    event PlayerVoted(address voter);
    event PlayerKilled(address player);
        
    constructor(uint _playersCount, uint _villagerCount, uint _werewolfCount, uint _seerCount) {
        gameCreator = msg.sender;

        playersCount = _playersCount;
        alivePlayerCount = _playersCount;

        villagerCount = _villagerCount;
        aliveVillagerCount = _villagerCount;

        werewolfCount = _werewolfCount;
        seerCount = _seerCount;

        remainingPlayerRoles = defaultPlayerRoles; 
    }
    
    modifier isCreator() {
        require(msg.sender == gameCreator, "Only the game creator can perform this action");
        _;
    }

    modifier isAlive() {
        require(!isDeadMapping[msg.sender], "You are dead and cannot perform this action");
        _;
    }

    modifier isVillager() {
        require(isVillagerMapping[msg.sender], "Only the villager can perform this action");
        _;
    }

    modifier isSeer() {
        require(isSeerMapping[msg.sender], "Only the Seer can perform this action");
        _;
    }

    modifier isWerewolf() {
        require(isWerewolfMapping[msg.sender], "Only the Werewolf can perform this action");
        _;
    }

    modifier isPlayer(address _address) {
        require(isPlayerMapping[_address], "The user is not a player in this game");
        _;
    }

    function seerIdentify() public isSeer isAlive returns(address) {
        emit SeerIdentifiedWerewolf();

        for (uint i = 0; i< playerList.length; i++) {
            address player = playerList[i];
            if (isWerewolfMapping[player]) {
                return player;  
            }
        } 

        // this should not occur
        return address(0);
    }

    function werewolfKill(address _playerAddress) public atStage(Stages.NightTimeWerewolf) isWerewolf isAlive isPlayer(_playerAddress) {

        require(!isDeadMapping[_playerAddress], "Player is already dead");
        isDeadMapping[_playerAddress] = true;
        emit PlayerKilled(_playerAddress);

        if (isVillagerMapping[_playerAddress]) {
            aliveVillagerCount -= 1;
        }

        alivePlayerCount -= 1;
        nextStage();
        emit DayStarted();
    }
    
    function villagerVote(address _playerAddress) public atStage(Stages.DayTime) isVillager isAlive isPlayer(_playerAddress) {
        require(!hasVoted[msg.sender], "You have already voted");
        hasVoted[msg.sender] = true;
        voteCount += 1;
        playerVotedCount[_playerAddress] += 1;

        // if every alive villager has voted
        if (voteCount == aliveVillagerCount) {
            address payable playerToKill = payable(address(0));

            // get maximum voted player to be killed
            for (uint i = 0; i< playerList.length; i++) {
                address payable player = playerList[i];
                uint count = playerVotedCount[player];

                if (count > aliveVillagerCount/2) {
                    playerToKill = player;
                }
            }

            // no majority vote, move to next stage
            if (playerToKill == payable(address(0))) {
                voteCount = 0;
                resetHasVoted();
                resetPlayerVotedCount();
                nextStage();
                emit NightStarted();
            }

            if (isVillagerMapping[playerToKill]) {
                aliveVillagerCount -= 1;
            }

            isDeadMapping[playerToKill] = true;
            alivePlayerCount -= 1;
            
            // if werewolf is dead, end game, all non werewolf players win and receive a fair share of the pool 
            if (isWerewolfMapping[playerToKill]) {
                emit GameEnded("Villagers win");
            }
            
            // if only werewolf is left, end game, werewolf win and receive all money pool 
            else if (alivePlayerCount == 1) {
                playerToKill.transfer(0.05 ether);
                resetVariables();
                emit GameEnded("Werewolf wins");
            }

            // else move to next stage 
            else {
                voteCount = 0;
                resetHasVoted();
                resetPlayerVotedCount();
                nextStage();
                emit NightStarted();
            }
        } 

    }

    function giveWinningsToNonWerewolfAndResetGame() public isCreator {
        for (uint i = 0; i<5; i++) {
            address payable player = playerList[i];
            if (!isWerewolfMapping[player]) {
                player.transfer((5 * 0.25) * 0.01 ether);
            }
        } 
        resetVariables();
        emit giveWinningsToNonWerewolf();
    }

    function giveWinningsToWerewolfAndResetGame() public isCreator {
        for (uint i = 0; i<5; i++) {
            address payable player = playerList[i];
            if (isWerewolfMapping[player]) {
                player.transfer(0.05 ether);
            }
        } 
        resetVariables();
        emit giveWinningsToWerewolf();
    }

    function resetPlayerVotedCount() private {
        for (uint i = 0; i< playerList.length; i++) {
            address player = playerList[i];
            delete playerVotedCount[player];
        }
    }

    function resetHasVoted() private {
        for (uint i = 0; i< playerList.length; i++) {
            address player = playerList[i];
            delete hasVoted[player];
        }
    }

    function resetVariables() private {
        for (uint i = 0; i< playerList.length; i++) {
            address player = playerList[i];
            delete hasVoted[player];
            delete isWerewolfMapping[player];
            delete isVillagerMapping[player];
            delete isSeerMapping[player];
            delete isDeadMapping[player];
            delete isPlayerMapping[player];
        }
        delete playerList;
    }
    
    function startGame() public {
        require(playerList.length == playersCount, "Not enough players");

        emit GameStarted();
    }

    function random() private view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp)));
    }
    
    function joinGame() public payable {
        require(!isPlayerMapping[msg.sender], "You have already joined the game");

        // receives 0.01 ether as player fees
        require(msg.value == 0.01 ether, "0.01 ETH is needed to join the game");
        require(playerList.length < playersCount, "The game is full");

        // update player list 
        isPlayerMapping[msg.sender] = true;
        isWerewolfMapping[msg.sender] = false;
        isSeerMapping[msg.sender] = false;
        isVillagerMapping[msg.sender] = false;
        address payable addr = payable(msg.sender);
        playerList.push(addr);

        // Get randomly assigned roles
        uint randomIndex = random() % remainingPlayerRoles.length;
        Roles role = remainingPlayerRoles[randomIndex];

        // remove role from remainingPlayerRoles by swapping with last index
        Roles lastElement = remainingPlayerRoles[remainingPlayerRoles.length-1];
        remainingPlayerRoles[randomIndex] = lastElement;
        remainingPlayerRoles.pop();

        // update mapping with role 
        if (role == Roles.werewolf) {
            isWerewolfMapping[msg.sender] = true;
        }
        else if (role == Roles.villager) {
            isVillagerMapping[msg.sender] = true;
        }
        else if (role == Roles.seer) {
            isSeerMapping[msg.sender] = true;
        }

        emit PlayerJoined(msg.sender);

    }

    
    // -------------------------------------
    // Getter functions
    // -------------------------------------

    function isPlayerWerewolf(address _playerAddress) public view isCreator returns(bool) {
        return isWerewolfMapping[_playerAddress];
    }

    function isPlayerSeer(address _playerAddress) public view isCreator returns(bool) {
        return isSeerMapping[_playerAddress];
    }

    function isPlayerVillager(address _playerAddress) public view isCreator returns(bool) {
        return isVillagerMapping[_playerAddress];
    }

    function isPlayerDead(address _playerAddress) public view returns(bool) {
        return isDeadMapping[_playerAddress];
    }

    function getStage() public view returns(Stages) {
        return stage;
    }

    function getAliveVillagerCount() public view returns(uint) {
        return aliveVillagerCount;
    }

    function getPlayerVotedCount(address _playerAddress) public view returns(uint) {
        return playerVotedCount[_playerAddress];
    }
}
