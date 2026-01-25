// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/EscrowV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "../contracts/mocks/MockMarketplace.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract EscrowV1OfferTest is Test {
    EscrowV1 public escrowImplementation;
    EscrowV1 public escrow;
    MockIDRX public idrxToken;
    MockMarketplace public marketplace;
    
    address public owner;
    address public treasury;
    address public buyer;
    address public seller;
    address public attacker;
    
    uint256 constant LISTING_ID = 1;
    uint256 constant OFFER_PRICE = 90_000_000 * 1e18; // 90M IDRX (below 100M asking)
    uint256 constant DEPOSIT_AMOUNT = 900_000 * 1e18; // 1% of 90M
    uint256 constant ASKING_PRICE = 100_000_000 * 1e18;

    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        buyer = makeAddr("buyer");
        seller = makeAddr("seller");
        attacker = makeAddr("attacker");
        
        // Deploy mock IDRX token
        idrxToken = new MockIDRX();
        // Deploy Mock Marketplace
        marketplace = new MockMarketplace();

        // Setup default listing
        marketplace.setListing(
            LISTING_ID,
            seller,
            ASKING_PRICE,
            IMarketplace.ListingState.ACTIVE
        );

        // Deploy implementation
        escrowImplementation = new EscrowV1();
        
        // Deploy proxy
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
        
        // Mint IDRX to buyer
        idrxToken.mint(buyer, 1_000_000_000 * 1e18); // 1B IDRX
        
        // Approve escrow contract
        vm.prank(buyer);
        idrxToken.approve(address(escrow), type(uint256).max);
    }
    
    function test_MakeOffer() public {
        vm.prank(buyer);
        escrow.makeOffer(LISTING_ID, OFFER_PRICE);

        (
            uint256 id,
            uint256 listingId,
            address _buyer,
            uint256 offerPrice,
            uint256 depositAmount,
            uint256 timestamp,
            uint256 expiresAt,
            EscrowV1.OfferState state,
            uint256 escrowId
        ) = escrow.offers(1);

        assertEq(id, 1);
        assertEq(listingId, LISTING_ID);
        assertEq(_buyer, buyer);
        assertEq(offerPrice, OFFER_PRICE);
        assertEq(depositAmount, DEPOSIT_AMOUNT);
        assertEq(uint(state), uint(EscrowV1.OfferState.ACTIVE));
        assertEq(escrowId, 0);

        // Check deposit transfer
        assertEq(idrxToken.balanceOf(address(escrow)), DEPOSIT_AMOUNT);
    }

    function test_AcceptOffer() public {
        vm.prank(buyer);
        escrow.makeOffer(LISTING_ID, OFFER_PRICE);

        vm.prank(seller);
        escrow.acceptOffer(1, EscrowV1.EncryptionMethod.ECIES_WALLET);

        // Check Offer updated
        (,,,,,,,, uint256 escrowId) = escrow.offers(1);
        assertEq(escrowId, 1);
        
        // Check Escrow Created
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(txn.amount, OFFER_PRICE);
        assertEq(uint(txn.state), uint(EscrowV1.EscrowState.CREATED));
        assertEq(txn.totalFunded, DEPOSIT_AMOUNT); // Partial funding
    }

    function test_RejectOffer() public {
        vm.prank(buyer);
        escrow.makeOffer(LISTING_ID, OFFER_PRICE);

        uint256 buyerBalanceBefore = idrxToken.balanceOf(buyer);

        vm.prank(seller);
        escrow.rejectOffer(1);

        // Check Offer State
        (,,,,,,, EscrowV1.OfferState state,) = escrow.offers(1);
        assertEq(uint(state), uint(EscrowV1.OfferState.REJECTED));

        // Check Refund
        assertEq(idrxToken.balanceOf(buyer), buyerBalanceBefore + DEPOSIT_AMOUNT);
    }

    function test_CancelOffer() public {
        vm.prank(buyer);
        escrow.makeOffer(LISTING_ID, OFFER_PRICE);

        uint256 buyerBalanceBefore = idrxToken.balanceOf(buyer);

        vm.prank(buyer);
        escrow.cancelOffer(1);

        // Check Offer State
        (,,,,,,, EscrowV1.OfferState state,) = escrow.offers(1);
        assertEq(uint(state), uint(EscrowV1.OfferState.CANCELLED));

        // Check Refund
        assertEq(idrxToken.balanceOf(buyer), buyerBalanceBefore + DEPOSIT_AMOUNT);
    }

    function test_CompleteFunding() public {
        vm.prank(buyer);
        escrow.makeOffer(LISTING_ID, OFFER_PRICE);

        vm.prank(seller);
        escrow.acceptOffer(1, EscrowV1.EncryptionMethod.ECIES_WALLET);

        (,,,,,,,, uint256 escrowId) = escrow.offers(1);

        // Complete Funding
        vm.prank(buyer);
        escrow.completeFunding(escrowId);

        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(uint(txn.state), uint(EscrowV1.EscrowState.FUNDED));
        assertEq(txn.totalFunded, OFFER_PRICE);
        
        // Check total balance
        assertEq(idrxToken.balanceOf(address(escrow)), OFFER_PRICE);
    }
}
