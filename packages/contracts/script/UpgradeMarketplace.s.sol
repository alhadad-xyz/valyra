// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../contracts/MarketplaceV1.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

interface IUUPS {
    function upgradeToAndCall(address newImplementation, bytes memory data) external payable;
}

contract UpgradeMarketplace is Script {
    function run() external {
        string memory privateKeyStr = vm.envString("BASE_SEPOLIA_PRIVATE_KEY");
        // Add 0x prefix if not present
        if (bytes(privateKeyStr).length == 64) {
            privateKeyStr = string(abi.encodePacked("0x", privateKeyStr));
        }
        uint256 deployerPrivateKey = vm.parseUint(privateKeyStr);
        address deployer = vm.addr(deployerPrivateKey);
        
        // Address of the existing proxy
        // Defaults to the one seen in user logs: 0xd7dc67800280c6c4edc8214b245632796b3c1d22 (Checksummed)
        address proxyAddress = vm.envOr("MARKETPLACE_PROXY_ADDRESS", address(0xD7Dc67800280c6C4eDC8214B245632796B3c1d22));
        
        console.log("Upgrading Marketplace at:", proxyAddress);
        console.log("Deployer:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy new implementation
        MarketplaceV1 newImpl = new MarketplaceV1();
        console.log("New Implementation:", address(newImpl));
        
        // 2. Upgrade Proxy
        // UUPS: Call upgradeToAndCall(newImpl, "") on the Proxy
        // Cast to IUUPS interface
        IUUPS(proxyAddress).upgradeToAndCall(address(newImpl), "");
        console.log("Upgrade successful");
        
        vm.stopBroadcast();
    }
}
