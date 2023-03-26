// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract nftQuest{
    IERC20 public rpg;

    enum characterState { battling, idle}

    constructor(
        address _rpgToken
    ) {
        rpg = IERC20(_rpgToken);
    }

    struct Character {
        string name; // character name; set by player
        string character_image; // cid for character images; chosen randomly from the list of 42 ipfs images;
        uint256 id; // character id; will be randomly generated
        uint256 level; // character level; starts at level 1; for each level gained, gain 1 attk
        uint256 attk; //  character attack; generated randomly through chainlink
        uint256 exp; // character exp currently
        characterState state;
        address owner; // owner of character address
    }

    uint256 public numCharacters = 0;
    uint256 public base_level = 1;
    mapping(uint256 => Character) public characters;

    //unable to extract data from IPFS efficiently so manually inputing CID
    string[] public ipfs_images = ["QmVf16CBSGAPNkSbcfTLsKvK62iJDGa3KwKy8oFbvikftC",
        "QmbQroCRC93YjK4K75AoUyyFhh5BpBxKXwFNYFfaSDuDHG",
        "QmNT6BstM3VAEjxAsNbK6b75owFirDF9WraPycZGJEDHhi",
        "QmYjfbBexNgdrDayWszNkjLC7ARnEDUxgtZVWCbhGai8r3",
        "QmPMuqHs2TQAQxqxVbt7nTiFiuccd73Mjzr538bazkRVwi",
        "Qma8HmLAgKPcvtj7rAoYpBB7E1EfTJpC1ARhuEvA7S1eTe",
        "QmXcoDtUshndVuhVK7uiBvT25menLUATvCh4gywc3QvTUt",
        "QmWaamaHQ4QbKQD5rfB9xkJgkZG9YuikM7pJVmNkkMzEJq",
        "QmdpEJkhYJhTtpSYSDqd9nSMdUbj4ZyFwzwHUsQDY3FEMB",
        "QmSJdMiUewjmadQLwbLaZUdLwJmV9jrFT2u91aTzLZY5s6",
        "QmaJkaZny13XSZ13F9y4yVMQoQHND6m19LWPPxKLc3vqyJ",
        "QmRttnuNNQcDpfDwyeraN6tkKzLdwuJ4LwB84wfWB8zwsZ",
        "Qmd2C39hwZ2kWgT6mEanyHERXtyXp8rJsZN2xDVVkS4tCn",
        "Qmc2yvXMhMomnJ7R2HtL67WvYgRsqiusmPYDeXKwXGna6z",
        "QmSb6L8GnvjEJStmnqjeVkJtZS4fJZ7D4mUDN73gDP6DAv",
        "QmSyWNjWdp53Atd2xoQeeZZqfnFH3fqXPfExQ9fLcNkxgJ",
        "QmW5ZNJXvFy5DWqyiZoMaBkWpSR91oKfLZADkpjXnpuJNK",
        "QmR3D38D8xa4LJuqPZGrxiHHU5WZst7QxpPKvL5dFhJSV6",
        "QmWt8uKNZLf2iWpThHQo19qbmGpQd7XHsog2X13A5CQfkc",
        "Qmen2FcWSQJwc652e67kT7dtPmZWkuJTykYiDzSWiFK2qC",
        "QmYnLesgT4GfNgKxLJqTAEYkcvQcxRjuHNeVKq2x2ktqu9",
        "QmZnnw9BnRztaA7bxeTCcL8wBfSU5jz7Me46pHwDu94Uav",
        "QmdyXr5qCpHuNSxvXrZ4exuR3u7zsvYTWsAj4BHHMDZb6d",
        "QmSFvUXWtweV6Z7kXB2xGqAQxM85qcduSmuX11tyxgLNwY",
        "QmT3ySmqqx6MNZEGApkSHG75XwC4Nh7HzXBLEXTrebARcV",
        "QmRU2eheYgK3TpRTdvjdo94UPkz4Pu5iKzP7MthYZddF3Z",
        "QmdxVKCFSdwqr4tvwjqE8cNsq8xQd3NBGBYdF93XxweRxx",
        "QmShhNm1bZ6eZncaAs3xkZMd3byGosX6WCrjXo9ePrYA2N",
        "QmSDpRYD8oqJkQ86TeYKpjCHC5Ffjsiu2xQ8qxD8eepiUD",
        "Qmcg6wVbcnbZTv71pKixQ41WmxNaD7E9PRxtoBPRBQRBZH",
        "Qme92TsLFC8JJ8KYmELxMUjnZm24tmjSoPFEfN8UJjEotE",
        "Qmc6WTdL2bPKGPinDk4iVNg24yMecbdtd7EyeyzWW71pAD",
        "Qmd4ddwpukQKDC8jBnSMBLiMoqL9rHxr3SvYx6coif2HsC",
        "QmcAGSfGijefrkSP1ZnvjkjTBedNdhxitqiqCLw5agDJsM",
        "QmPhMhjhSWzjzWWb2Q9uX7hbrba1CL11e145cgaJqz21Ym",
        "QmfYs5ZvhizWwrRjfP9Y5A7bkbhhzZTtP9iAbL14eeXin7",
        "QmcjEkihJodzezXUxGT2WnTPm3sDMRu9uyd6VU1YXhLyan",
        "QmWACNHKYn5GfpPXsFQyhwXC5do2YmfTkaPjudE4Qh7yYj",
        "Qma66dPVPs35XZM8EwvZ6YqYseexYzvmGhmKqevNRovCzm",
        "QmU2BVXtFB4JMLRiuN2xWacGYrgG2VLXCb6hY4zqgUxCis",
        "QmQmaUmBrNPmDUb5oHDf3EpvYtheUpbGywWWkPuoe4V35D",
        "QmWmn4RGTPjfNyEktheJr9bj5QtfMFwmbAQZCYczcTkngc"];

    //dedicated gateway for ipfs
    string public gateway = "https://is4302.infura-ipfs.io/ipfs/";

    //function to randomise attack/defense
    function random(uint number) public view returns(uint){
        return uint(keccak256(abi.encodePacked(block.timestamp,msg.sender))) % number;
    }

    //function to mint a new character, and add "characters" map. requires at least 0.1ETH to mint
    function mint(string memory name) public payable returns(uint256) {
        require(msg.value > 0.1 ether, "at least 0.1 ETH is needed to mint a new character");
        
        //to find a way to generate probability distribution for attack example(only 25% chance of attack > 15)
        //generate random attack max 20
        uint256 rand_attack = random(20);

        //choose random character image from ipfs (out of the 42 characters)
        uint256 image_cid = random(42);
        string memory image_ipfs = string(abi.encodePacked(gateway, ipfs_images[image_cid]));

        uint256 newId = numCharacters++;

        //new Character object
        Character memory newCharacter = Character(
            name,
            image_ipfs,
            newId,
            base_level,
            rand_attack,
            0,
            characterState.idle,
            msg.sender
        );

        //return amount that is not used to mint back to them
        uint256 amount_sent = msg.value;
        uint256 refund_amount = amount_sent - 100000000000000000;
        address payable receiver = payable(msg.sender);
        bool success = receiver.send(refund_amount);
        require(success, "Failed to send Ether");
        
        characters[newId] = newCharacter; 

        return newId; 
    }

    //modifier to ensure a function is callable only by its owner    
    modifier ownerOnly(uint256 characterId) {
        require(characters[characterId].owner == msg.sender);
        _;
    }

    modifier validCharacterId(uint256 characterId) {
        require(characterId < numCharacters);
        _;
    }

    event monsterFightCompleted(string status, uint256 rewards);

    // fighting monsters
    function fightMonsters(uint256 characterId) public ownerOnly(characterId) validCharacterId(characterId) {
        require(characters[characterId].state == characterState.idle);
        characters[characterId].state = characterState.battling;
        uint256 myAttk = characters[characterId].attk + 5;
        //random attk suited to the current attk of your character
        uint256 enemyAttk = random(myAttk);

        string memory status;
        uint256 rewards;

        if (enemyAttk < myAttk) {
            // fight won, give 50 exp per monster killed, rewards scale per level
            status = "Win";
            rewards = characters[characterId].level * 3 / 2;
            rpg.transfer(msg.sender, rewards);
            characters[characterId].exp += 50;
        } else if (enemyAttk > myAttk) {
            status = "Lost";
            rewards = 0;
        } else {
            status = "Draw";
            rewards = 0;
        }

        endFight(characterId);
        characters[characterId].state = characterState.idle;
        emit monsterFightCompleted(status, rewards);
    }

    //resolving exp leveling issue
    function endFight(uint256 characterId) public ownerOnly(characterId) validCharacterId(characterId) {
        uint256 level_threshold = characters[characterId].level * 50 + characters[characterId].level * 10;
        if (characters[characterId].exp >= level_threshold) {
            characters[characterId].level += 1;
        }
    }

    function getRPGBalance(address account) public view returns (uint256) {
        return rpg.balanceOf(account);
    }
}