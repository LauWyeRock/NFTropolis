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