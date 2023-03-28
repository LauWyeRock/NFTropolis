// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract RPGToken is ERC20, Ownable{
    
    uint256 init_supply;

    constructor(uint256 initialSupply) ERC20("RPGToken", "RPG"){
        init_supply = initialSupply;
    }

    function issueToken() public onlyOwner{
        require(init_supply != 0, "Max Supply Reached");
        //limit supply to 100000
        _mint(msg.sender, 100000);
        init_supply = init_supply - 100000;
    }
}