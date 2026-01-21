// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/EscrowV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "../contracts/mocks/MockMarketplace.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract EscrowV1EmergencyTest is Test {
    EscrowV1 public escrowImplementation;
    EscrowV1 public escrow;
    MockIDRX public idrxToken;
    MockMarketplace public marketplace;
    
    address public owner;
    address public treasury;
    address public buyer;
    address public seller;
    address public safetyWallet;
    
    uint256 constant LISTING_ID = 1;
    uint256 constant ESCROW_AMOUNT = 100_000_000 * 1e18;
    
    // Offer constants
    uint256 constant OFFER_PRICE = 90_000_000 * 1e18;
    uint256 constant DEPOSIT_AMOUNT = 900_000 * 1e18;

    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        buyer = makeAddr("buyer");
        seller = makeAddr("seller");
        safetyWallet = makeAddr("safetyWallet");
        
        idrxToken = new MockIDRX();
        marketplace = new MockMarketplace();

        marketplace.setListing(
            LISTING_ID,
            seller,
            ESCROW_AMOUNT,
            IMarketplace.ListingState.ACTIVE
        );

        escrowImplementation = new EscrowV1();
        
        bytes memory initData = abi.encodeWithSelector(
            EscrowV1.initialize.selector,
            treasury,
            address(idrxToken),
            address(marketplace)
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(escrowImplementation),
            initData
        );
        
        escrow = EscrowV1(address(proxy));
        
        idrxToken.mint(buyer, 1_000_000_000 * 1e18);
        vm.prank(buyer);
        idrxToken.approve(address(escrow), type(uint256).max);
    }
    
    function test_SetSafetyWallet() public {
        vm.expectEmit(true, true, false, false);
        emit EscrowV1.SafetyWalletUpdated(address(0), safetyWallet);
        escrow.setSafetyWallet(safetyWallet);
        assertEq(escrow.safetyWallet(), safetyWallet);
    }

    function test_EmergencyEjectEscrow_Funded() public {
        escrow.setSafetyWallet(safetyWallet);

        // Create funded escrow
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(LISTING_ID, ESCROW_AMOUNT, EscrowV1.EncryptionMethod.ECIES_WALLET);

        escrow.pause();

        escrow.emergencyEjectEscrow(escrowId);

        assertEq(idrxToken.balanceOf(safetyWallet), ESCROW_AMOUNT);
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(uint(txn.state), uint(EscrowV1.EscrowState.EMERGENCY));
    }

    function test_EmergencyEjectEscrow_Transition() public {
        escrow.setSafetyWallet(safetyWallet);

        // Advance to TRANSITION
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(LISTING_ID, ESCROW_AMOUNT, EscrowV1.EncryptionMethod.ECIES_WALLET);
        
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, bytes32(uint256(1)));
        
        vm.prank(buyer);
        escrow.confirmReceipt(escrowId);

        escrow.pause();
        
        // Eject
        escrow.emergencyEjectEscrow(escrowId);

        // Only retainer should be ejected (10%)
        uint256 retainer = (ESCROW_AMOUNT * 250 / 10000); // Wait, fee calculation.
        // Fee is 2.5%, SellerPayout = 97.5%
        // Retainer is 10% of SellerPayout.
        // 100M * 0.975 = 97.5M
        // 97.5M * 0.10 = 9.75M
        
        uint256 expectedRetainer = 9_750_000 * 1e18;
        assertEq(idrxToken.balanceOf(safetyWallet), expectedRetainer);
        
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(uint(txn.state), uint(EscrowV1.EscrowState.EMERGENCY));
    }
    
    function test_EmergencyEjectOffer() public {
        escrow.setSafetyWallet(safetyWallet);

        vm.prank(buyer);
        escrow.makeOffer(LISTING_ID, OFFER_PRICE);

        escrow.pause();

        escrow.emergencyEjectOffer(1);

        assertEq(idrxToken.balanceOf(safetyWallet), DEPOSIT_AMOUNT);
        
        (,,,,,,, EscrowV1.OfferState state,) = escrow.offers(1);
        assertEq(uint(state), uint(EscrowV1.OfferState.CANCELLED));
    }
    
    function test_EmergencyEject_RevertIfNotPaused() public {
        escrow.setSafetyWallet(safetyWallet);
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(LISTING_ID, ESCROW_AMOUNT, EscrowV1.EncryptionMethod.ECIES_WALLET);
        
        vm.expectRevert(bytes4(keccak256("ExpectedPause()"))); // PausableUpgradeable error
        escrow.emergencyEjectEscrow(escrowId);
    }
    
    function test_EmergencyEject_RevertZeroSafetyWallet() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(LISTING_ID, ESCROW_AMOUNT, EscrowV1.EncryptionMethod.ECIES_WALLET);
        
        escrow.pause();

        vm.expectRevert("Safety wallet not set");
        escrow.emergencyEjectEscrow(escrowId);
    }
}
