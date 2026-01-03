// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/MarketplaceV1.sol";
import "../contracts/EscrowV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title DeploySystem
 * @dev Unified deployment script for Valyra Marketplace and Escrow
 * 
 * Usage:
 * forge script script/DeploySystem.s.sol:DeploySystem --rpc-url base-sepolia --broadcast --verify
 */
contract DeploySystem is Script {
    function run() external {
        // Load environment variables
        string memory privateKeyStr = vm.envString("BASE_SEPOLIA_PRIVATE_KEY");
        // Add 0x prefix if not present
        if (bytes(privateKeyStr).length == 64) {
            privateKeyStr = string(abi.encodePacked("0x", privateKeyStr));
        }
        uint256 deployerPrivateKey = vm.parseUint(privateKeyStr);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying System with deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // ============ Step 1: Deploy Token ============
        address idrxAddress;
        
        // check if IDRX_TOKEN_ADDRESS env var is set, otherwise deploy mock
        try vm.envAddress("IDRX_TOKEN_ADDRESS") returns (address existingToken) {
            console.log("\n=== Using Existing IDRX Token ===");
            idrxAddress = existingToken;
            console.log("Token Address:", idrxAddress);
        } catch {
            console.log("\n=== Deploying MockIDRX Token ===");
            MockIDRX idrxToken = new MockIDRX();
            idrxAddress = address(idrxToken);
            console.log("MockIDRX deployed at:", idrxAddress);
            
            // Mint some tokens to deployer for testing
            idrxToken.mint(deployer, 1_000_000_000 * 1e18); // 1B IDRX
            console.log("Minted 1B IDRX to deployer");
        }
        
        // Agent address (default to deployer for now if not set)
        address agentAddress = deployer;
        try vm.envAddress("AGENT_ADDRESS") returns (address agent) {
            agentAddress = agent;
        } catch {}
        console.log("Agent Address:", agentAddress);
        
        // Treasury address (default to deployer)
        address treasuryAddress = deployer;
        try vm.envAddress("TREASURY_ADDRESS") returns (address treasury) {
            treasuryAddress = treasury;
        } catch {}
        console.log("Treasury Address:", treasuryAddress);

        // ============ Step 2: Deploy Marketplace ============
        console.log("\n=== Deploying MarketplaceV1 ===");
        MarketplaceV1 marketplaceImpl = new MarketplaceV1();
        console.log("Marketplace Implementation:", address(marketplaceImpl));
        
        bytes memory marketplaceInit = abi.encodeWithSelector(
            MarketplaceV1.initialize.selector,
            idrxAddress,
            agentAddress
        );
        
        ERC1967Proxy marketplaceProxy = new ERC1967Proxy(
            address(marketplaceImpl),
            marketplaceInit
        );
        address marketplaceAddress = address(marketplaceProxy);
        console.log("Marketplace Proxy (Main):", marketplaceAddress);
        
        // ============ Step 3: Deploy Escrow ============
        console.log("\n=== Deploying EscrowV1 ===");
        EscrowV1 escrowImpl = new EscrowV1();
        console.log("Escrow Implementation:", address(escrowImpl));
        
        bytes memory escrowInit = abi.encodeWithSelector(
            EscrowV1.initialize.selector,
            treasuryAddress,
            idrxAddress,
            marketplaceAddress
        );
        
        ERC1967Proxy escrowProxy = new ERC1967Proxy(
            address(escrowImpl),
            escrowInit
        );
        address escrowAddress = address(escrowProxy);
        console.log("Escrow Proxy (Main):", escrowAddress);
        
        vm.stopBroadcast();
        
        // ============ Summary ============
        console.log("\n=== Deployment Summary ===");
        console.log("Network: Base Sepolia (or local)");
        console.log("Deployer:", deployer);
        console.log("IDRX Token:", idrxAddress);
        console.log("Marketplace:", marketplaceAddress);
        console.log("Escrow:", escrowAddress);
        console.log("\n=== .env format ===");
        console.log("NEXT_PUBLIC_IDRX_ADDRESS=", idrxAddress);
        console.log("NEXT_PUBLIC_MARKETPLACE_ADDRESS=", marketplaceAddress);
        console.log("NEXT_PUBLIC_ESCROW_ADDRESS=", escrowAddress);
    }
}
