// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/MarketplaceV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract MarketplaceV1FunctionsTest is Test {
    MarketplaceV1 public implementation;
    MarketplaceV1 public marketplace;
    MockIDRX public mockToken;
    ERC1967Proxy public proxy;
    
    address public owner;
    address public agent;
    address public seller;
    address public buyer;
    
    uint256 constant MINIMUM_SELLER_STAKE = 750_000 * 1e18;
    
    function setUp() public {
        owner = address(this);
        agent = address(0x1);
        seller = address(0x2);
        buyer = address(0x3);
        
        // Deploy mock token
        mockToken = new MockIDRX();
        
        // Deploy implementation
        implementation = new MarketplaceV1();
        
        // Deploy proxy and initialize
        bytes memory initData = abi.encodeWithSelector(
            MarketplaceV1.initialize.selector,
            address(mockToken),
            agent
        );
        proxy = new ERC1967Proxy(address(implementation), initData);
        marketplace = MarketplaceV1(address(proxy));
        
        // Setup seller
        mockToken.mint(seller, MINIMUM_SELLER_STAKE * 2);
        
        // Close Genesis program to force staking (for cleaner tests)
        marketplace.endGenesisProgram();
        
        vm.startPrank(seller);
        mockToken.approve(address(marketplace), MINIMUM_SELLER_STAKE);
        marketplace.stakeToSell();
        vm.stopPrank();
    }
    
    function createListing(string memory title, uint256 price) internal returns (uint256) {
        vm.startPrank(seller);
        uint256 id = marketplace.createListing(
            title,
            "QmMetadata",
            price,
            MarketplaceV1.VerificationLevel.BASIC,
            bytes32(uint256(1)),
            hex"1234",
            "build-id"
        );
        vm.stopPrank();
        return id;
    }
    
    function testGetActiveListings() public {
        // Create 3 listings
        createListing("Listing 1", 100);
        createListing("Listing 2", 200);
        uint256 id3 = createListing("Listing 3", 300);
        
        // Cancel listing 3 to ensure it's not returned
        vm.prank(seller);
        marketplace.cancelListing(id3);
        
        // Test pagination 0-1
        MarketplaceV1.Listing[] memory page1 = marketplace.getActiveListings(0, 1);
        assertEq(page1.length, 1);
        assertEq(page1[0].title, "Listing 1");
        
        // Test pagination 1-2
        MarketplaceV1.Listing[] memory page2 = marketplace.getActiveListings(1, 2);
        assertEq(page2.length, 1);
        assertEq(page2[0].title, "Listing 2");
        
        // Test pagination 0-10 (should return 2 active)
        MarketplaceV1.Listing[] memory all = marketplace.getActiveListings(0, 10);
        assertEq(all.length, 2);
        assertEq(all[0].title, "Listing 1");
        assertEq(all[1].title, "Listing 2");
    }
    
    function testVerifyBuildId() public {
        uint256 id = createListing("Listing 1", 100);
        
        // Verify as agent
        vm.prank(agent);
        vm.expectEmit(true, true, false, true);
        emit MarketplaceV1.BuildIdVerified(id, true);
        marketplace.verifyBuildId(id, true);
        
        (,,,,,,,,,,,, bool verified) = marketplace.listings(id);
        assertTrue(verified);
        
        // Verify un-verification
        vm.prank(agent);
        marketplace.verifyBuildId(id, false);
        
        (,,,,,,,,,,,, verified) = marketplace.listings(id);
        assertFalse(verified);
        
        // Revert if not agent
        vm.prank(seller);
        vm.expectRevert("Only agent can call this function");
        marketplace.verifyBuildId(id, true);
    }
    
    function testRecordHeartbeat() public {
        vm.prank(seller);
        
        vm.expectEmit(true, false, false, true);
        emit MarketplaceV1.HeartbeatRecorded(seller, block.timestamp);
        
        marketplace.recordHeartbeat();
        
        (address actSeller, uint256 lastHeartbeat,,,) = marketplace.sellerActivity(seller);
        assertEq(actSeller, seller);
        assertEq(lastHeartbeat, block.timestamp);
    }
    
    function testUpdateListing() public {
        uint256 id = createListing("Listing 1", 100);
        
        vm.prank(seller);
        vm.expectEmit(true, false, false, true);
        emit MarketplaceV1.ListingUpdated(id, "QmNew", 500);
        
        marketplace.updateListing(id, "QmNew", 500);
        
        (,,, string memory meta, uint256 price,,,,,,,,) = marketplace.listings(id);
        assertEq(meta, "QmNew");
        assertEq(price, 500);
        
        // Test partial update (only price)
        vm.prank(seller);
        marketplace.updateListing(id, "", 600);
        (,,, meta, price,,,,,,,,) = marketplace.listings(id);
        assertEq(meta, "QmNew"); // Unchanged
        assertEq(price, 600);
    }
    
    function testPauseResumeListing() public {
        uint256 id = createListing("Listing 1", 100);
        
        // Agent pauses
        vm.prank(agent);
        vm.expectEmit(true, false, false, true);
        emit MarketplaceV1.ListingPaused(id, "Health check failed");
        marketplace.pauseListing(id);
        
        (,,,,,,, MarketplaceV1.ListingState state,,,,,) = marketplace.listings(id);
        assertEq(uint256(state), uint256(MarketplaceV1.ListingState.PAUSED));
        
        // Seller resumes
        vm.prank(seller);
        vm.expectEmit(true, false, false, true);
        emit MarketplaceV1.ListingResumed(id);
        marketplace.resumeListing(id);
        
        (,,,,,,, state,,,,,) = marketplace.listings(id);
        assertEq(uint256(state), uint256(MarketplaceV1.ListingState.ACTIVE));
        
        // Seller cannot pause
        vm.prank(seller);
        vm.expectRevert("Only agent can call this function");
        marketplace.pauseListing(id);
    }
    
    function testPauseInactiveSeller() public {
        // Need to simulate time passing for heartbeat check
        // checkSellerActivity returns false, false initially
        
        // Agent calls pause
        vm.prank(agent);
        marketplace.pauseInactiveSeller(seller);
        
        // Should NOT be paused yet as heartbeat is fresh (from createListing setup)
        (,,, bool isActive, bool isPaused) = marketplace.sellerActivity(seller);
        assertTrue(isActive);
        assertFalse(isPaused);
        
        // Advance time past warning + pause period
        vm.warp(block.timestamp + 30 days + 7 days + 8 days);
        
        vm.prank(agent);
        vm.expectEmit(true, false, false, true);
        emit MarketplaceV1.SellerPaused(seller);
        marketplace.pauseInactiveSeller(seller);
        
        (,,, isActive, isPaused) = marketplace.sellerActivity(seller);
        assertFalse(isActive);
        assertTrue(isPaused);
    }
}
