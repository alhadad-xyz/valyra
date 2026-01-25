// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockFeeToken is ERC20 {
    constructor() ERC20("Fee Token", "FEE") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        uint256 fee = amount / 100; // 1% fee
        uint256 amountAfterFee = amount - fee;
        
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amountAfterFee);
        _burn(from, fee); // Burn the fee
        
        return true;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        uint256 fee = amount / 100; // 1% fee
        uint256 amountAfterFee = amount - fee;
        
        _transfer(msg.sender, to, amountAfterFee);
        _burn(msg.sender, fee); // Burn the fee
        
        return true;
    }
}
