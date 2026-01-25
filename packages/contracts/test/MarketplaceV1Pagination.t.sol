// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/MarketplaceV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title MarketplaceV1PaginationTest
 * @dev Comprehensive tests for getActiveListings pagination and edge cases
 */
contract MarketplaceV1PaginationTest is Test {
    MarketplaceV1 public implementation;
    MarketplaceV1 public marketplace;
    MockIDRX public mockToken;
    ERC1967Proxy public proxy;
    
    address public owner;
    address public agent;
    address public seller;
    
    uint256 constant MINIMUM_SELLER_STAKE = 750_000 * 1e18;
    
    function setUp() public {
        owner = address(this);
        agent = address(0x1);
        seller = address(0x2);
        
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
        
        // Close Genesis program to force staking
        marketplace.endGenesisProgram();
        
        // Setup seller
        mockToken.mint(seller, MINIMUM_SELLER_STAKE * 2);
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
    
    /**
     * @dev Test with zero limit - should return empty array
     */
    function testGetActiveListingsWithZeroLimit() public {
        createListing("Listing 1", 100);
        createListing("Listing 2", 200);
        
        MarketplaceV1.Listing[] memory result = marketplace.getActiveListings(0, 0);
        assertEq(result.length, 0, "Should return empty array for limit = 0");
    }
    
    /**
     * @dev Test with offset beyond total active listings
     */
    function testGetActiveListingsWithOffsetBeyondTotal() public {
        createListing("Listing 1", 100);
        createListing("Listing 2", 200);
        
        // Offset of 5 when only 2 listings exist
        MarketplaceV1.Listing[] memory result = marketplace.getActiveListings(5, 10);
        assertEq(result.length, 0, "Should return empty array for offset >= total");
    }
    
    /**
     * @dev Test with offset equal to total
     */
    function testGetActiveListingsWithOffsetEqualToTotal() public {
        createListing("Listing 1", 100);
        createListing("Listing 2", 200);
        
        MarketplaceV1.Listing[] memory result = marketplace.getActiveListings(2, 10);
        assertEq(result.length, 0, "Should return empty array for offset = total");
    }
    
    /**
     * @dev Test with no active listings
     */
    function testGetActiveListingsWithNoActiveListings() public {
        // No listings created
        MarketplaceV1.Listing[] memory result = marketplace.getActiveListings(0, 10);
        assertEq(result.length, 0, "Should return empty array when no active listings");
    }
    
    /**
     * @dev Test with all listings cancelled
     */
    function testGetActiveListingsWithAllCancelled() public {
        uint256 id1 = createListing("Listing 1", 100);
        uint256 id2 = createListing("Listing 2", 200);
        
        // Cancel all listings
        vm.startPrank(seller);
        marketplace.cancelListing(id1);
        marketplace.cancelListing(id2);
        vm.stopPrank();
        
        MarketplaceV1.Listing[] memory result = marketplace.getActiveListings(0, 10);
        assertEq(result.length, 0, "Should return empty array when all listings cancelled");
    }
    
    /**
     * @dev Test pagination with various offsets and limits
     */
    function testGetActiveListingsPaginationVariations() public {
        // Create 5 listings
        createListing("Listing 1", 100);
        createListing("Listing 2", 200);
        createListing("Listing 3", 300);
        createListing("Listing 4", 400);
        createListing("Listing 5", 500);
        
        // Test: Get first 2
        MarketplaceV1.Listing[] memory page1 = marketplace.getActiveListings(0, 2);
        assertEq(page1.length, 2);
        assertEq(page1[0].title, "Listing 1");
        assertEq(page1[1].title, "Listing 2");
        
        // Test: Get middle 2
        MarketplaceV1.Listing[] memory page2 = marketplace.getActiveListings(2, 2);
        assertEq(page2.length, 2);
        assertEq(page2[0].title, "Listing 3");
        assertEq(page2[1].title, "Listing 4");
        
        // Test: Get last 2 (with limit > remaining)
        MarketplaceV1.Listing[] memory page3 = marketplace.getActiveListings(4, 10);
        assertEq(page3.length, 1, "Should return only remaining items");
        assertEq(page3[0].title, "Listing 5");
        
        // Test: Get all
        MarketplaceV1.Listing[] memory all = marketplace.getActiveListings(0, 100);
        assertEq(all.length, 5);
    }
    
    /**
     * @dev Test with mixed active and cancelled listings
     */
    function testGetActiveListingsWithMixedStates() public {
        createListing("Active 1", 100);
        uint256 cancelled = createListing("Cancelled", 200);
        createListing("Active 2", 300);
        
        vm.prank(seller);
        marketplace.cancelListing(cancelled);
        
        MarketplaceV1.Listing[] memory result = marketplace.getActiveListings(0, 10);
        assertEq(result.length, 2, "Should return only active listings");
        assertEq(result[0].title, "Active 1");
        assertEq(result[1].title, "Active 2");
    }
    
    /**
     * @dev Test exact limit match
     */
    function testGetActiveListingsExactLimitMatch() public {
        createListing("Listing 1", 100);
        createListing("Listing 2", 200);
        createListing("Listing 3", 300);
        
        MarketplaceV1.Listing[] memory result = marketplace.getActiveListings(0, 3);
        assertEq(result.length, 3, "Should return exact count when limit matches total");
    }
    
    /**
     * @dev Test with large offset and limit
     */
    function testGetActiveListingsWithLargeValues() public {
        createListing("Listing 1", 100);
        
        // Very large offset and limit
        MarketplaceV1.Listing[] memory result = marketplace.getActiveListings(1000, 1000);
        assertEq(result.length, 0, "Should handle large values gracefully");
    }
    
    /**
     * @dev Test boundary: offset at last item
     */
    function testGetActiveListingsOffsetAtLastItem() public {
        createListing("Listing 1", 100);
        createListing("Listing 2", 200);
        createListing("Listing 3", 300);
        
        MarketplaceV1.Listing[] memory result = marketplace.getActiveListings(2, 1);
        assertEq(result.length, 1);
        assertEq(result[0].title, "Listing 3");
    }
}
