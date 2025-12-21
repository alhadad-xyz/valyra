// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockIDRX
 * @dev Mock IDRX token for testing purposes
 */
contract MockIDRX is ERC20 {
    constructor() ERC20("Mock IDRX", "IDRX") {
        // Mint initial supply to deployer
        _mint(msg.sender, 1_000_000_000 * 1e18); // 1 billion IDRX
    }
    
    /**
     * @dev Mint tokens to an address (for testing)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
