pragma solidity ^0.8.0;

contract Werewolf {
    
    struct Player {
        address playerAddress;
        bool isWerewolf;
        bool isDead;
        bool hasVoted;
        uint numVotes;
    }
    
    address public gameCreator;
    uint256 public numPlayers;
    uint256 public numWerewolves;
    uint256 public numAlivePlayers;
    uint256 public numVotes;
    uint256 public numNights;
    uint256 public numDays;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public voteEndTime;
    uint256 public nightEndTime;
    uint256 public dayEndTime;
    uint256 public lastVoteTime;
    uint256 public nightCount;
    uint256 public dayCount;
    uint256 public numActionsCompleted;
    bool public isGameInProgress;
    bool public isVoting;
    bool public isDaytime;

    mapping (address => Player) public players;
    address[] public playerList;
    mapping (address => bool) public hasJoined;
    mapping (address => bool) public hasVoted;
    mapping (address => bool) public hasKilled;
    mapping (address => bool) public hasHealed;
    mapping (address => bool) public isWerewolf;
    mapping (address => bool) public isHealer;
    mapping (address => bool) public isSeer;
    mapping (address => bool) public isDead;
    
    event GameStarted(uint256 numPlayers, uint256 numWerewolves, uint256 startTime);
    event PlayerJoined(address playerAddress);
    event PlayerHealed(address playerAddress);
    event WerewolfTurn(address playerAddress);
    event VillagerTurn(address playerAddress);
    event VotingTurn(address playerAddress);
    event VoteStarted(uint256 endTime);
    event VoteEnded();
    event NightStarted(uint256 endTime);
    event NightEnded();
    event DayStarted(uint256 endTime);
    event DayEnded();
    event PlayerVoted(address voter, address votee);
    event PlayerKilled(address player);
    event GameEnded(string winner);
    
    modifier onlyCreator() {
        require(msg.sender == gameCreator, "Only the game creator can perform this action");
        _;
    }
    
    modifier onlyDuringNight() {
        require(block.timestamp > nightEndTime && block.timestamp < dayEndTime, "This action can only be performed during the night");
        _;
    }
    
    modifier onlyDuringDay() {
        require(block.timestamp > dayEndTime && block.timestamp < nightEndTime, "This action can only be performed during the day");
        _;
    }
    
    modifier onlyAlive() {
        require(!isDead[msg.sender], "You are dead and cannot perform this action");
        _;
    }

    modifier onlyHealer {
        require(isHealer[msg.sender], "Only the Healer can perform this action");
        _;
    }

    modifier onlySeer {
        require(isSeer[msg.sender], "Only the Seer can perform this action");
        _;
    }

    modifier onlyWerewolf {
        require(isWerewolf[msg.sender], "Only the Werewolf can perform this action");
        _;
    }
    
    constructor() {
        gameCreator = msg.sender;
    }
    
    function startGame(uint256 _numPlayers, uint256 _numWerewolves) public onlyCreator {
        require(_numPlayers >= _numWerewolves + 1, "There must be more players than werewolves");
        require(numPlayers == 0, "The game has already started");
        numPlayers = _numPlayers;
        numWerewolves = _numWerewolves;
        numAlivePlayers = numPlayers;
        startTime = block.timestamp;
        nightEndTime = startTime + 30 seconds;
        dayEndTime = nightEndTime + 30 seconds;
        voteEndTime = nightEndTime;
        numNights = 0;
        numDays = 0;
        emit GameStarted(numPlayers, numWerewolves, startTime);
    }
    
    function joinGame() public {
        require(numPlayers > 0, "The game has not yet started");
        require(!hasJoined[msg.sender], "You have already joined the game");
        require(numPlayers > 0, "The game is full");
        hasJoined[msg.sender] = true;
        players[playerList[numPlayers]] = Player(msg.sender, false, false, false, 0);
        numPlayers--;
        emit PlayerJoined(msg.sender);
    }
    
function startVote() public onlyDuringDay {
    require(numAlivePlayers > 0, "No players left alive in the game");
    require(!isDaytime, "It's not yet daytime");
    require(numActionsCompleted == numAlivePlayers, "All players have not completed their night actions yet");
    isVoting = true;
    numActionsCompleted = 0;
    // uint256 maxVotes = 0;
    // address maxVotedPlayer;
    for (uint256 i = 1; i <= numPlayers; i++) {
        address playerAddress = playerList[i];
        if (!isDead[playerAddress]) {
            players[playerAddress].numVotes = 0;
        }
    }
    emit VoteStarted(dayCount);
    for (uint256 i = numPlayers + 1; i <= numPlayers + numAlivePlayers; i++) {
        if (!isDead[playerList[i]]) {
            emit VotingTurn(playerList[i]);
        }
    }
}


function vote(address _playerAddress) public onlyDuringDay onlyAlive {
    require(hasJoined[_playerAddress], "The specified player has not joined the game");
    require(!hasVoted[msg.sender], "You have already voted");
    hasVoted[msg.sender] = true;
    players[_playerAddress].hasVoted = true;
    numVotes--;
    emit PlayerVoted(msg.sender, _playerAddress);
    if (numVotes == 0) {
        endVote();
    }
}

function endVote() internal {
    address mostVotedPlayer = address(0);
    uint256 maxVotes = 0;
    for (uint256 i = numPlayers + 1; i <= numPlayers + numAlivePlayers; i++) {
        if (!isDead[players[playerList[i]].playerAddress] && players[playerList[i]].hasVoted) {
            uint256 numPlayerVotes = getNumVotes(players[playerList[i]].playerAddress);
            if (numPlayerVotes > maxVotes) {
                mostVotedPlayer = players[playerList[i]].playerAddress;
                maxVotes = numPlayerVotes;
            }
        }
    }
    if (mostVotedPlayer != address(0)) {
        killPlayer(mostVotedPlayer);
    }
    emit VoteEnded();
}

function getNumVotes(address _playerAddress) internal view returns (uint256) {
    // uint256 numVotes = 0;
    // for (uint256 i = numPlayers + 1; i <= numPlayers + numAlivePlayers; i++) {
    //     if (players[playerList[i]].hasVoted && players[playerList[i]].playerAddress == _playerAddress) {
    //         numVotes++;
    //     }
    // }
    return players[_playerAddress].numVotes;
}

function killPlayer(address _playerAddress) internal {
    isDead[_playerAddress] = true;
    numAlivePlayers--;
    players[_playerAddress].isDead = true;
    if (isWerewolf[_playerAddress]) {
        numWerewolves--;
    }
    if (numWerewolves == 0) {
        endGame("Villagers");
    } else if (numWerewolves >= numAlivePlayers / 2) {
        endGame("Werewolves");
    } else {
        emit PlayerKilled(_playerAddress);
        if (numAlivePlayers == numWerewolves) {
            endGame("Werewolves");
        } else if (numWerewolves == 0) {
            endGame("Villagers");
        } else {
            if (lastVoteTime + 60 seconds < block.timestamp) {
                startVote();
            }
            if (block.timestamp > nightEndTime) {
                endDay();
            }
        }
    }
}

function endDay() internal {
    numDays++;
    nightEndTime = block.timestamp + 30 seconds;
    dayEndTime = nightEndTime + 30 seconds;
    numVotes = 0;
    lastVoteTime = block.timestamp;
    for (uint256 i = numPlayers + 1; i <= numPlayers + numAlivePlayers; i++) {
        players[playerList[i]].hasVoted = false;
    }
    emit DayEnded();
    if (numWerewolves == 0) {
        endGame("Villagers");
    } else if (numWerewolves >= numAlivePlayers / 2) {
        endGame("Werewolves");
    } else {
        startNight();
    }
}


function startNight() internal {
    numNights++;
    nightEndTime = block.timestamp + 30 seconds;
    dayEndTime = nightEndTime + 30 seconds;
    emit NightStarted(nightCount);

    for (uint256 i = numPlayers + 1; i <= numPlayers + numAlivePlayers; i++) {
        if (isWerewolf[playerList[i]]) {
            emit WerewolfTurn(playerList[i]);
        } else {
            emit VillagerTurn(playerList[i]);
        }
    }
}


function werewolfKill(address _playerAddress) public onlyDuringNight onlyWerewolf {
    require(hasJoined[_playerAddress], "The specified player has not joined the game");
    require(!isDead[_playerAddress], "The specified player is already dead");
    require(!hasKilled[msg.sender], "You have already killed a player tonight");
    hasKilled[msg.sender] = true;
    killPlayer(_playerAddress);
}

function healPlayer(address _playerAddress) public onlyDuringNight onlyHealer {
    require(hasJoined[_playerAddress], "The specified player has not joined the game");
    require(!isDead[_playerAddress], "The specified player is already dead");
    require(!hasHealed[msg.sender], "You have already healed a player tonight");
    hasHealed[msg.sender] = true;
    // players[_playerAddress].isSaved = true;
    emit PlayerHealed(_playerAddress);
}

function seerPeek(address _playerAddress) public view onlyDuringNight onlySeer returns (bool) {
    require(hasJoined[_playerAddress], "The specified player has not joined the game");
    require(_playerAddress != msg.sender, "You cannot peek at yourself");
    return isWerewolf[_playerAddress];
}

function endGame(string memory _winners) internal {
    isGameInProgress = false;
    emit GameEnded(_winners);
}

function getNumPlayers() public view returns (uint256) {
    return numPlayers;
}

function getNumAlivePlayers() public view returns (uint256) {
    return numAlivePlayers;
}

function getNumWerewolves() public view returns (uint256) {
    return numWerewolves;
}

function getPlayers() public view returns (Player[] memory) {
    Player[] memory tempPlayers = new Player[](numPlayers);
    for (uint256 i = 1; i <= numPlayers; i++) {
        tempPlayers[i - 1] = players[playerList[i]];
    }
    return tempPlayers;
}

function getPlayer(address _playerAddress) public view returns (Player memory) {
    require(hasJoined[_playerAddress], "The specified player has not joined the game");
    return players[_playerAddress];
}

function getPlayerAtIndex(uint256 _index) public view returns (Player memory) {
    require(_index >= 0 && _index < numPlayers, "The specified index is out of range");
    return players[playerList[_index + 1]];
}

}