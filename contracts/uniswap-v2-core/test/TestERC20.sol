
pragma solidity ^0.8.20;

import '../../lib/openzeppelin/contracts/token/ERC20/ERC20.sol';

contract TestERC20 is ERC20 {
    constructor(string memory name_, string memory symbol_, uint _totalSupply) ERC20(name_, symbol_) {
        _mint(msg.sender, _totalSupply);
    }
}
