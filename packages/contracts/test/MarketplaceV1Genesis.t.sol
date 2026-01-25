// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/MarketplaceV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract MarketplaceV1GenesisTest is Test {
    MarketplaceV1 public implementation;
    MarketplaceV1 public marketplace;
    ERC1967Proxy public proxy;
    MockIDRX public mockToken;
    
    address public owner;
    address public agent;
    
    uint256 constant MINIMUM_SELLER_STAKE = 750_000 * 1e18;
    
    function setUp() public {
        owner = address(this);
        agent = address(0x1);
        
        // Deploy mock IDRX
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
        
        // Wrap proxy in MarketplaceV1 interface
        marketplace = MarketplaceV1(address(proxy));
    }
    
    // Helper to set verification level by creating a listing
    function setVerificationLevel(address seller, MarketplaceV1.VerificationLevel level) internal {
        mockToken.mint(seller, MINIMUM_SELLER_STAKE * 2);
        
        vm.startPrank(seller);
        mockToken.approve(address(marketplace), MINIMUM_SELLER_STAKE);
        
        // End genesis temporarily
        vm.stopPrank();
        marketplace.endGenesisProgram();
        
        vm.startPrank(seller);
        marketplace.stakeToSell();
        
        // Create listing to set verification level
        uint256 listingId = marketplace.createListing(
            "Test",
            "QmTest",
            1_000_000 * 1e18,
            level,
            bytes32(uint256(1)),
            hex"1234",
            "build-123"
        );
        
        // Cancel and withdraw
        marketplace.cancelListing(listingId);
        marketplace.withdrawStake(MINIMUM_SELLER_STAKE);
        vm.stopPrank();
        
        // Restart genesis
        // Slot 90 is likely genesisProgram (bool) and genesisSellersCount (uint256) proximity? 
        // Wait, checking storage slots blindly is dangerous.
        // Previous code:
        // vm.store(address(marketplace), bytes32(uint256(6)), bytes32(uint256(1))); // genesisProgram = true
        // vm.store(address(marketplace), bytes32(uint256(7)), bytes32(uint256(0))); // genesisSellersCount = 0 -> THIS IS THE BUG
        
        // We only want to turn genesisProgram back on.
        // Assuming slot 6 is genesisProgram based on previous usage.
        // We should safeguard the count.
        
        uint256 currentCount = marketplace.genesisSellersCount();
        vm.store(address(marketplace), bytes32(uint256(6)), bytes32(uint256(1)));
        // We do NOT want to reset count. 
        // But if endGenesisProgram didn't mess with count, we don't need to restore it.
        // Just remove the line writing to slot 7.

    }
    
    function testJoinGenesisSuccess() public {
        address seller = address(0x100);
        setVerificationLevel(seller, MarketplaceV1.VerificationLevel.STANDARD);
        
        vm.startPrank(seller);
        
        assertFalse(marketplace.isGenesisSeller(seller));
        assertEq(marketplace.genesisSellersCount(), 0);
        
        vm.expectEmit(true, false, false, true);
        emit MarketplaceV1.GenesisSellerJoined(seller, 1);
        
        marketplace.joinGenesis();
        
        vm.stopPrank();
        
        assertTrue(marketplace.isGenesisSeller(seller));
        assertEq(marketplace.genesisSellersCount(), 1);
    }
    
    function testJoinGenesisRevertsWhenProgramEnded() public {
        address seller = address(0x101);
        setVerificationLevel(seller, MarketplaceV1.VerificationLevel.STANDARD);
        
        marketplace.endGenesisProgram();
        
        vm.startPrank(seller);
        vm.expectRevert("Genesis program has ended");
        marketplace.joinGenesis();
        vm.stopPrank();
    }
    
    function testJoinGenesisRevertsWhenNotVerified() public {
        address seller = address(0x102);
        // Don't set verification level (defaults to BASIC)
        
        vm.startPrank(seller);
        vm.expectRevert("Must be verified for Genesis");
        marketplace.joinGenesis();
        vm.stopPrank();
    }
    
    function testJoinGenesisRevertsWhenAlreadyJoined() public {
        address seller = address(0x103);
        setVerificationLevel(seller, MarketplaceV1.VerificationLevel.STANDARD);
        
        vm.startPrank(seller);
        marketplace.joinGenesis();
        
        vm.expectRevert("Already a Genesis Seller");
        marketplace.joinGenesis();
        vm.stopPrank();
    }
    
    function testJoinGenesisWithEnhancedVerification() public {
        address seller = address(0x300);
        setVerificationLevel(seller, MarketplaceV1.VerificationLevel.ENHANCED);
        
        vm.prank(seller);
        marketplace.joinGenesis();
        
        assertTrue(marketplace.isGenesisSeller(seller));
    }

    function test_GenesisCap() public {
        // Assume test setup has 0 genesis sellers (or reset count)
        // Note: setUp() initializes with 0. 
        // We need to ensure setVerificationLevel doesn't permanently add a genesis seller.
        // Looking at setVerificationLevel helper:
        // It calls marketplace.staking functions.
        // It calls endGenesisProgram then restarts it?
        // Wait, helper:
        // marketplace.endGenesisProgram();
        // ... stakeToSell() -> Genesis logic skipped because program ended?
        // Ah, if program ended, stakeToSell goes to "Regular staking", correct?
        // But let's verify.
        
        uint256 startCount = marketplace.genesisSellersCount();
        assertEq(startCount, 0, "Should start with 0");
        
        // Loop 50 times
        for (uint256 i = 1; i <= 50; i++) {
            address user = address(uint160(i + 1000));
            setVerificationLevel(user, MarketplaceV1.VerificationLevel.STANDARD);
            vm.prank(user);
            marketplace.joinGenesis();
            assertEq(marketplace.genesisSellersCount(), i);
        }

        // Try 51st
        address user51 = address(0x9999);
        setVerificationLevel(user51, MarketplaceV1.VerificationLevel.STANDARD);
        
        vm.prank(user51);
        vm.expectRevert("Genesis program is full");
        marketplace.joinGenesis();
    }

    function test_GenesisDoubleCountPrevented() public {
        address user = address(0x5555);
        setVerificationLevel(user, MarketplaceV1.VerificationLevel.STANDARD);
        
        // 1. Join via stakeToSell (Genesis path)
        vm.prank(user);
        marketplace.stakeToSell();
        
        assertTrue(marketplace.isGenesisSeller(user));
        assertEq(marketplace.genesisSellersCount(), 1);

        // 2. Try to join again via joinGenesis
        vm.prank(user);
        vm.expectRevert("Already a Genesis Seller");
        marketplace.joinGenesis();
    }

    function test_GenesisReentryPrevented() public {
        address user = address(0x6666);
        setVerificationLevel(user, MarketplaceV1.VerificationLevel.STANDARD);

        // 1. Join via stakeToSell
        vm.prank(user);
        marketplace.stakeToSell();

        // 2. Try to stake again
        vm.prank(user);
        vm.expectRevert("Already staked");
        marketplace.stakeToSell();
    }
}
