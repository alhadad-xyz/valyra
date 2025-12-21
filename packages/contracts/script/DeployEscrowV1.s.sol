// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/EscrowV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title DeployEscrowV1
 * @dev Deployment script for EscrowV1 with UUPS proxy pattern
 * 
 * Usage:
 * forge script script/DeployEscrowV1.s.sol:DeployEscrowV1 --rpc-url base-sepolia --broadcast --verify
 */
contract DeployEscrowV1 is Script {
    function run() external {
        // Load environment variables
        string memory privateKeyStr = vm.envString("BASE_SEPOLIA_PRIVATE_KEY");
        // Add 0x prefix if not present
        string memory privateKeyWithPrefix = string(abi.encodePacked("0x", privateKeyStr));
        uint256 deployerPrivateKey = vm.parseUint(privateKeyWithPrefix);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying EscrowV1 with deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Step 1: Deploy MockIDRX token (for testnet only)
        console.log("\n=== Deploying MockIDRX Token ===");
        MockIDRX idrxToken = new MockIDRX();
        console.log("MockIDRX deployed at:", address(idrxToken));
        
        // Mint some tokens to deployer for testing
        idrxToken.mint(deployer, 1_000_000_000 * 1e18); // 1B IDRX
        console.log("Minted 1B IDRX to deployer");
        
        // Step 2: Deploy EscrowV1 implementation
        console.log("\n=== Deploying EscrowV1 Implementation ===");
        EscrowV1 escrowImplementation = new EscrowV1();
        console.log("EscrowV1 implementation deployed at:", address(escrowImplementation));
        
        // Step 3: Prepare initialization data
        address treasuryAddress = deployer; // Use deployer as treasury for testnet
        console.log("Treasury address:", treasuryAddress);
        
        bytes memory initData = abi.encodeWithSelector(
            EscrowV1.initialize.selector,
            treasuryAddress,
            address(idrxToken)
        );
        
        // Step 4: Deploy ERC1967 Proxy
        console.log("\n=== Deploying ERC1967 Proxy ===");
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(escrowImplementation),
            initData
        );
        console.log("Proxy deployed at:", address(proxy));
        
        // Step 5: Get the proxied contract
        EscrowV1 escrow = EscrowV1(address(proxy));
        
        // Step 6: Verify deployment
        console.log("\n=== Verifying Deployment ===");
        console.log("Escrow treasury:", escrow.treasuryAddress());
        console.log("Escrow IDRX token:", address(escrow.idrxToken()));
        console.log("Escrow owner:", escrow.owner());
        console.log("Escrow counter:", escrow.escrowCounter());
        
        require(escrow.treasuryAddress() == treasuryAddress, "Treasury mismatch");
        require(address(escrow.idrxToken()) == address(idrxToken), "IDRX token mismatch");
        require(escrow.owner() == deployer, "Owner mismatch");
        
        vm.stopBroadcast();
        
        // Print deployment summary
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Base Sepolia Testnet");
        console.log("Deployer:", deployer);
        console.log("MockIDRX Token:", address(idrxToken));
        console.log("EscrowV1 Implementation:", address(escrowImplementation));
        console.log("EscrowV1 Proxy (Main Contract):", address(proxy));
        console.log("Treasury:", treasuryAddress);
        console.log("\n=== Save these addresses for frontend integration ===");
        console.log("ESCROW_CONTRACT_ADDRESS=", address(proxy));
        console.log("IDRX_TOKEN_ADDRESS=", address(idrxToken));
    }
}
