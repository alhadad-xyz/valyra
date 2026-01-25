// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/MarketplaceV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract SlashingTest is Test {
    MarketplaceV1 public implementation;
    MarketplaceV1 public marketplace;
    MockIDRX public mockToken;
    ERC1967Proxy public proxy;

    address public owner;
    address public agent;
    address public seller;

    uint256 constant MINIMUM_SELLER_STAKE = 750_000 * 1e18;
    uint256 constant SLASH_PENALTY = 250_000 * 1e18;

    event SellerSlashed(address indexed seller, uint256 amount, string reason, uint256 newSlashCount);

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

    function testSlashSeller() public {
        // Setup: Seller stakes MORE than minimum
        vm.startPrank(seller);
        mockToken.approve(address(marketplace), MINIMUM_SELLER_STAKE * 2);
        // Stake normally only takes MINIMUM. We need a way to stake MORE?
        // Marketplace contract: stakeToSell() takes MINIMUM_SELLER_STAKE fixed.
        // It does NOT allow arbitrary amounts.
        // So we CANNOT stake more than minimum via stakeToSell().
        // Thus, ANY slash WILL deactivate the seller if they only have MINIMUM.
        
        // Let's modify the expectation: Assert it IS inactive.
        marketplace.stakeToSell();
        vm.stopPrank();

        // Action: Slash
        vm.prank(agent);
        
        vm.expectEmit(true, false, false, true);
        emit SellerSlashed(seller, SLASH_PENALTY, "Violation", 1);
        
        marketplace.slashSeller(seller, "Violation");

        // Verify state
        (address s, uint256 amount, , bool isActive, uint256 count) = marketplace.sellerStakes(seller);
        assertEq(s, seller);
        assertEq(amount, MINIMUM_SELLER_STAKE - SLASH_PENALTY);
        assertFalse(isActive); // Should be inactive because 500k < 750k
        assertEq(count, 1);
    }

    function testSlashSellerDeactivation() public {
         // Setup: Seller stakes EXACTLY MINIMUM
        vm.startPrank(seller);
        mockToken.approve(address(marketplace), MINIMUM_SELLER_STAKE);
        marketplace.stakeToSell();
        vm.stopPrank();

        // Verify initial stake
        (, uint256 initialStake,,,) = marketplace.sellerStakes(seller);
        assertEq(initialStake, MINIMUM_SELLER_STAKE);

        // Action: Slash
        // MIN = 750k. Slash = 250k. Remaining = 500k.
        // 500k < 750k -> Should deactivate.
        
        vm.prank(agent);
        marketplace.slashSeller(seller, "Violation 1");

        // Verify state
        (,,, bool isActive,) = marketplace.sellerStakes(seller);
        assertFalse(isActive, "Seller should be deactivated via slash");
    }

    function testOnlyAgentCanSlash() public {
        vm.startPrank(seller);
        mockToken.approve(address(marketplace), MINIMUM_SELLER_STAKE);
        marketplace.stakeToSell();
        vm.stopPrank();

        vm.expectRevert("Only agent can call this function");
        marketplace.slashSeller(seller, "Exploit");
    }
}
