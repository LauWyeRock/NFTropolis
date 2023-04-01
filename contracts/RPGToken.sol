// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";  // Importing the ERC20 standard contract from OpenZeppelin
import "@openzeppelin/contracts/access/Ownable.sol"; // Importing the Ownable contract from OpenZeppelin


contract RPGToken is ERC20, Ownable{ // Defining the RPGToken contract which is an ERC20 token and inherits from Ownable contract
    
    uint256 init_supply; // Declare a variable to hold the initial supply of the token

    constructor(uint256 initialSupply) ERC20("RPGToken", "RPG"){  // Constructor to initialize the token with a name, symbol and initial supply
        init_supply = initialSupply; // Assigning the initial supply to the variable
    }

    function issueToken() public onlyOwner{
        require(init_supply != 0, "Max Supply Reached");
        /*Limit Issue Amount To 100000*/
        _mint(msg.sender, 100000);
        init_supply = init_supply - 100000;
    }

    function getCurrentSupply() public view returns(uint256) {
        return init_supply;
    }

    function issueTo(address _address) public {
        require(init_supply != 0, "Max Supply Reached");
        _mint(_address, 100000);
        init_supply = init_supply - 100000;
    }
}