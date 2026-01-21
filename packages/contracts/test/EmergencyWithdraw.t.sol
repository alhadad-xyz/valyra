// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/MarketplaceV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract EmergencyWithdrawTest is Test {
    MarketplaceV1 public implementation;
    MarketplaceV1 public marketplace;
    MockIDRX public mockToken;
    ERC1967Proxy public proxy;

    address public owner;
    address public agent;
    address public seller;

    uint256 constant MINIMUM_SELLER_STAKE = 750_000 * 1e18;
    uint256 constant EMERGENCY_COOLDOWN = 72 hours;

    function setUp() public {
        owner = address(this);
        agent = address(0x1);
        seller = address(0x2);

        mockToken = new MockIDRX();
        implementation = new MarketplaceV1();

        bytes memory initData = abi.encodeWithSelector(
            MarketplaceV1.initialize.selector,
            address(mockToken),
            agent
        );
        proxy = new ERC1967Proxy(address(implementation), initData);
        marketplace = MarketplaceV1(address(proxy));

        marketplace.endGenesisProgram();
        mockToken.mint(seller, MINIMUM_SELLER_STAKE * 2);
    }

    function testRequestEmergencyWithdraw() public {
        vm.startPrank(seller);
        mockToken.approve(address(marketplace), MINIMUM_SELLER_STAKE);
        marketplace.stakeToSell();

        marketplace.requestEmergencyWithdraw();
        
        uint256 withdrawTime = marketplace.emergencyWithdrawTime(seller);
        assertEq(withdrawTime, block.timestamp + EMERGENCY_COOLDOWN);
        vm.stopPrank();
    }

    function testExecuteEmergencyWithdrawTooEarly() public {
        vm.startPrank(seller);
        mockToken.approve(address(marketplace), MINIMUM_SELLER_STAKE);
        marketplace.stakeToSell();

        marketplace.requestEmergencyWithdraw();
        
        // Try immediately
        vm.expectRevert("Cooldown active");
        marketplace.executeEmergencyWithdraw();
        
        // Fast forward 71 hours
        vm.warp(block.timestamp + 71 hours);
        vm.expectRevert("Cooldown active");
        marketplace.executeEmergencyWithdraw();
        vm.stopPrank();
    }

    function testExecuteEmergencyWithdrawSuccess() public {
        vm.startPrank(seller);
        mockToken.approve(address(marketplace), MINIMUM_SELLER_STAKE);
        marketplace.stakeToSell();

        marketplace.requestEmergencyWithdraw();
        
        vm.warp(block.timestamp + 72 hours + 1);
        
        uint256 balBefore = mockToken.balanceOf(seller);
        marketplace.executeEmergencyWithdraw();
        uint256 balAfter = mockToken.balanceOf(seller);
        
        assertEq(balAfter - balBefore, MINIMUM_SELLER_STAKE);
        
        // Check state cleared
        (,,, bool isActive,) = marketplace.sellerStakes(seller);
        assertFalse(isActive);
        
        vm.stopPrank();
    }
}
