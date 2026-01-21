// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/EscrowV1.sol";
import "../contracts/mocks/MockIDRX.sol";
import "../contracts/mocks/MockMarketplace.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract EscrowV1Test is Test {
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
    uint256 constant ESCROW_AMOUNT = 100_000_000 * 1e18; // 100M IDRX
    
    event EscrowCreated(
        uint256 indexed escrowId,
        uint256 indexed listingId,
        address indexed buyer,
        address seller,
        uint256 amount
    );
    
    event FundsDeposited(
        uint256 indexed escrowId,
        address indexed buyer,
        uint256 amount,
        EscrowV1.EncryptionMethod encryptionMethod
    );
    
    event CredentialsUploaded(uint256 indexed escrowId, bytes32 credentialHash);
    
    event ReceiptConfirmed(
        uint256 indexed escrowId,
        uint256 immediateRelease,
        uint256 retainerAmount
    );
    
    event TransitionRetainerClaimed(uint256 indexed escrowId, uint256 amount);
    
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
            ESCROW_AMOUNT,
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
    
    // ============ Initialization Tests ============
    
    function test_Initialize() public view {
        assertEq(escrow.treasuryAddress(), treasury);
        assertEq(address(escrow.idrxToken()), address(idrxToken));
        assertEq(escrow.escrowCounter(), 0);
        assertEq(escrow.emergencyMode(), false);
        assertEq(escrow.owner(), owner);
        assertEq(escrow.marketplaceAddress(), address(marketplace));
    }
    
    function test_CannotInitializeTwice() public {
        vm.expectRevert();
        escrow.initialize(treasury, address(idrxToken), address(marketplace));
    }
    
    function test_CannotInitializeWithZeroAddresses() public {
        EscrowV1 newImpl = new EscrowV1();
        
        // Test zero treasury
        bytes memory initData = abi.encodeWithSelector(
            EscrowV1.initialize.selector,
            address(0),
            address(idrxToken),
            address(marketplace)
        );
        
        vm.expectRevert("Invalid treasury address");
        new ERC1967Proxy(address(newImpl), initData);
        
        // Test zero IDRX
        initData = abi.encodeWithSelector(
            EscrowV1.initialize.selector,
            treasury,
            address(0),
            address(marketplace)
        );
        
        vm.expectRevert("Invalid IDRX token address");
        new ERC1967Proxy(address(newImpl), initData);
    }
    
    // ============ UUPS Upgrade Tests ============
    
    function test_OnlyOwnerCanUpgrade() public {
        EscrowV1 newImplementation = new EscrowV1();
        
        vm.prank(attacker);
        vm.expectRevert();
        escrow.upgradeToAndCall(address(newImplementation), "");
        
        // Owner can upgrade
        escrow.upgradeToAndCall(address(newImplementation), "");
    }
    
    function test_UpgradePreservesState() public {
        // Create an escrow first
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        // Upgrade
        EscrowV1 newImplementation = new EscrowV1();
        escrow.upgradeToAndCall(address(newImplementation), "");
        
        // Verify state preserved
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(txn.buyer, buyer);
        assertEq(txn.seller, seller);
        assertEq(txn.amount, ESCROW_AMOUNT);
        assertEq(escrow.escrowCounter(), 1);
    }
    
    // ============ Deposit Tests ============
    
    function test_DepositFunds() public {
        vm.prank(buyer);
        
        vm.expectEmit(true, true, true, true);
        emit EscrowCreated(1, LISTING_ID, buyer, seller, ESCROW_AMOUNT);
        
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        assertEq(escrowId, 1);
        
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(txn.id, escrowId);
        assertEq(txn.listingId, LISTING_ID);
        assertEq(txn.buyer, buyer);
        assertEq(txn.seller, seller);
        assertEq(txn.amount, ESCROW_AMOUNT);
        assertEq(uint256(txn.state), uint256(EscrowV1.EscrowState.FUNDED));
        
        // Check fees calculated correctly
        (uint256 platformFee, uint256 sellerPayout) = escrow.calculateFees(ESCROW_AMOUNT);
        assertEq(txn.platformFee, platformFee);
        assertEq(txn.sellerPayout, sellerPayout);
        assertEq(platformFee, ESCROW_AMOUNT * 250 / 10000); // 2.5%
        
        // Check IDRX transferred
        assertEq(idrxToken.balanceOf(address(escrow)), ESCROW_AMOUNT);
    }
    
    function test_CannotDepositWithInvalidSeller() public {
        // Setup listing with zero address seller
        marketplace.setListing(
            2,
            address(0),
            ESCROW_AMOUNT,
            IMarketplace.ListingState.ACTIVE
        );

        vm.prank(buyer);
        vm.expectRevert("Invalid seller address");
        escrow.depositFunds(
            2,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
    }
    
    function test_CannotDepositToBuyerAsSeller() public {
        // Setup listing where buyer is seller
        marketplace.setListing(
            3,
            buyer,
            ESCROW_AMOUNT,
            IMarketplace.ListingState.ACTIVE
        );

        vm.prank(buyer);
        vm.expectRevert("Buyer cannot be seller");
        escrow.depositFunds(
            3,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
    }
    
    function test_CannotDepositZeroAmount() public {
        vm.prank(buyer);
        vm.expectRevert("Amount must be greater than 0");
        escrow.depositFunds(
            LISTING_ID,
            0,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
    }

    function test_CannotDepositIncorrectAmount() public {
        vm.prank(buyer);
        vm.expectRevert("Amount must match listing price");
        escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT - 1,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
    }

    function test_CannotDepositInactiveListing() public {
        // Setup inactive listing
         marketplace.setListing(
            4,
            seller,
            ESCROW_AMOUNT,
            IMarketplace.ListingState.PENDING
        );

        vm.prank(buyer);
        vm.expectRevert("Listing not active");
        escrow.depositFunds(
            4,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
    }
    
    // ============ Credential Upload Tests ============
    
    function test_UploadCredentialHash() public {
        // Create escrow
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        // Upload credentials
        bytes32 credHash = keccak256("encrypted_credentials");
        
        vm.prank(seller);
        vm.expectEmit(true, true, true, true);
        emit CredentialsUploaded(escrowId, credHash);
        
        escrow.uploadCredentialHash(escrowId, credHash);
        
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(txn.credentialHash, credHash);
        assertEq(uint256(txn.state), uint256(EscrowV1.EscrowState.DELIVERED));
        assertTrue(txn.verifyDeadline > block.timestamp);
    }
    
    function test_OnlySellerCanUploadCredentials() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        bytes32 credHash = keccak256("encrypted_credentials");
        
        vm.prank(attacker);
        vm.expectRevert("Only seller can call this function");
        escrow.uploadCredentialHash(escrowId, credHash);
    }
    
    function test_CannotUploadAfterHandoverDeadline() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        // Fast forward past handover deadline
        vm.warp(block.timestamp + 73 hours);
        
        bytes32 credHash = keccak256("encrypted_credentials");
        
        vm.prank(seller);
        vm.expectRevert("Handover deadline passed");
        escrow.uploadCredentialHash(escrowId, credHash);
    }
    
    // ============ Confirm Receipt Tests ============
    
    function test_ConfirmReceipt() public {
        // Create escrow and upload credentials
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        bytes32 credHash = keccak256("encrypted_credentials");
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, credHash);
        
        // Confirm receipt
        uint256 sellerBalanceBefore = idrxToken.balanceOf(seller);
        uint256 treasuryBalanceBefore = idrxToken.balanceOf(treasury);
        
        (uint256 platformFee, uint256 sellerPayout) = escrow.calculateFees(ESCROW_AMOUNT);
        uint256 retainer = (sellerPayout * 1000) / 10000; // 10%
        uint256 immediateRelease = sellerPayout - retainer;
        
        vm.prank(buyer);
        escrow.confirmReceipt(escrowId);
        
        // Check balances
        assertEq(idrxToken.balanceOf(seller), sellerBalanceBefore + immediateRelease);
        assertEq(idrxToken.balanceOf(treasury), treasuryBalanceBefore + platformFee);
        
        // Check escrow state
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(uint256(txn.state), uint256(EscrowV1.EscrowState.TRANSITION));
        
        // Check transition hold
        EscrowV1.TransitionHold memory hold = escrow.getTransitionHold(escrowId);
        assertEq(hold.retainedAmount, retainer);
        assertEq(hold.isClaimed, false);
        assertTrue(hold.releaseTime > block.timestamp);
    }
    
    function test_OnlyBuyerCanConfirmReceipt() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, keccak256("creds"));
        
        vm.prank(attacker);
        vm.expectRevert("Only buyer can call this function");
        escrow.confirmReceipt(escrowId);
    }
    
    function test_CannotConfirmBeforeCredentialsUploaded() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        vm.prank(buyer);
        vm.expectRevert("Invalid escrow state");
        escrow.confirmReceipt(escrowId);
    }
    
    // ============ Transition Retainer Tests ============
    
    function test_ClaimTransitionRetainer() public {
        // Setup: Create escrow, upload creds, confirm receipt
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, keccak256("creds"));
        
        vm.prank(buyer);
        escrow.confirmReceipt(escrowId);
        
        // Fast forward 7 days
        vm.warp(block.timestamp + 7 days);
        
        // Claim retainer
        uint256 sellerBalanceBefore = idrxToken.balanceOf(seller);
        EscrowV1.TransitionHold memory hold = escrow.getTransitionHold(escrowId);
        
        vm.prank(seller);
        escrow.claimTransitionRetainer(escrowId);
        
        // Check balance
        assertEq(idrxToken.balanceOf(seller), sellerBalanceBefore + hold.retainedAmount);
        
        // Check state
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(uint256(txn.state), uint256(EscrowV1.EscrowState.COMPLETED));
        
        hold = escrow.getTransitionHold(escrowId);
        assertTrue(hold.isClaimed);
        assertTrue(hold.isReleased);
    }
    
    function test_CannotClaimRetainerBeforeTransitionPeriod() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, keccak256("creds"));
        
        vm.prank(buyer);
        escrow.confirmReceipt(escrowId);
        
        // Try to claim immediately
        vm.prank(seller);
        vm.expectRevert("Transition period not ended");
        escrow.claimTransitionRetainer(escrowId);
    }
    
    function test_CannotClaimRetainerTwice() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, keccak256("creds"));
        
        vm.prank(buyer);
        escrow.confirmReceipt(escrowId);
        
        vm.warp(block.timestamp + 7 days);
        
        vm.prank(seller);
        escrow.claimTransitionRetainer(escrowId);
        
        // Try to claim again - state is now COMPLETED, so it will fail with "Invalid escrow state"
        vm.prank(seller);
        vm.expectRevert("Invalid escrow state");
        escrow.claimTransitionRetainer(escrowId);
    }
    
    // ============ Dispute Tests ============
    
    function test_RaiseDispute() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, keccak256("creds"));
        
        string memory evidence = "ipfs://evidence";
        
        vm.prank(buyer);
        escrow.raiseDispute(
            escrowId,
            EscrowV1.DisputeType.CREDENTIAL_MISMATCH,
            evidence
        );
        
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(uint256(txn.state), uint256(EscrowV1.EscrowState.DISPUTED));
        
        EscrowV1.Dispute memory dispute = escrow.getDispute(escrowId);
        assertEq(dispute.initiator, buyer);
        assertEq(uint256(dispute.disputeType), uint256(EscrowV1.DisputeType.CREDENTIAL_MISMATCH));
        assertEq(dispute.evidenceIpfs, evidence);
    }
    
    function test_ResolveDisputeFullRefund() public {
        // Setup dispute
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, keccak256("creds"));
        
        vm.prank(buyer);
        escrow.raiseDispute(
            escrowId,
            EscrowV1.DisputeType.CREDENTIAL_MISMATCH,
            "ipfs://evidence"
        );
        
        // Resolve with full refund
        uint256 buyerBalanceBefore = idrxToken.balanceOf(buyer);
        
        escrow.resolveDispute(
            escrowId,
            EscrowV1.DisputeResolution.FULL_REFUND,
            0
        );
        
        assertEq(idrxToken.balanceOf(buyer), buyerBalanceBefore + ESCROW_AMOUNT);
        
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(uint256(txn.state), uint256(EscrowV1.EscrowState.REFUNDED));
    }
    
    function test_ResolveDisputeReleaseToSeller() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, keccak256("creds"));
        
        vm.prank(buyer);
        escrow.raiseDispute(
            escrowId,
            EscrowV1.DisputeType.QUALITY_DISPUTE,
            "ipfs://evidence"
        );
        
        uint256 sellerBalanceBefore = idrxToken.balanceOf(seller);
        uint256 treasuryBalanceBefore = idrxToken.balanceOf(treasury);
        
        escrow.resolveDispute(
            escrowId,
            EscrowV1.DisputeResolution.RELEASE_TO_SELLER,
            0
        );
        
        (uint256 platformFee, uint256 sellerPayout) = escrow.calculateFees(ESCROW_AMOUNT);
        assertEq(idrxToken.balanceOf(seller), sellerBalanceBefore + sellerPayout);
        assertEq(idrxToken.balanceOf(treasury), treasuryBalanceBefore + platformFee);
    }
    
    // ============ Timeout Tests ============
    
    function test_TimeoutRefundWhenSellerDoesNotDeliver() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        // Fast forward past handover deadline
        vm.warp(block.timestamp + 73 hours);
        
        uint256 buyerBalanceBefore = idrxToken.balanceOf(buyer);
        
        escrow.claimTimeout(escrowId);
        
        assertEq(idrxToken.balanceOf(buyer), buyerBalanceBefore + ESCROW_AMOUNT);
        
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        assertEq(uint256(txn.state), uint256(EscrowV1.EscrowState.EXPIRED));
    }
    
    function test_TimeoutReleaseWhenBuyerDoesNotConfirm() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, keccak256("creds"));
        
        // Fast forward past verification deadline
        vm.warp(block.timestamp + 73 hours);
        
        uint256 sellerBalanceBefore = idrxToken.balanceOf(seller);
        uint256 treasuryBalanceBefore = idrxToken.balanceOf(treasury);
        
        escrow.claimTimeout(escrowId);
        
        (uint256 platformFee, uint256 sellerPayout) = escrow.calculateFees(ESCROW_AMOUNT);
        assertEq(idrxToken.balanceOf(seller), sellerBalanceBefore + sellerPayout);
        assertEq(idrxToken.balanceOf(treasury), treasuryBalanceBefore + platformFee);
    }
    
    // ============ Emergency Tests ============
    
    function test_ActivateEmergency() public {
        escrow.activateEmergency();
        
        assertTrue(escrow.emergencyMode());
        assertEq(escrow.emergencyActivatedAt(), block.timestamp);
    }
    
    function test_EmergencyWithdrawForBuyer() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        // Activate emergency
        escrow.activateEmergency();
        
        // Wait for cooldown
        vm.warp(block.timestamp + 73 hours);
        
        uint256 buyerBalanceBefore = idrxToken.balanceOf(buyer);
        
        vm.prank(buyer);
        escrow.emergencyWithdraw(escrowId);
        
        assertEq(idrxToken.balanceOf(buyer), buyerBalanceBefore + ESCROW_AMOUNT);
    }
    
    function test_OnlyOwnerCanActivateEmergency() public {
        vm.prank(attacker);
        vm.expectRevert();
        escrow.activateEmergency();
    }
    
    // ============ Admin Tests ============
    
    function test_SetTreasuryAddress() public {
        address newTreasury = makeAddr("newTreasury");
        
        escrow.setTreasuryAddress(newTreasury);
        
        assertEq(escrow.treasuryAddress(), newTreasury);
    }
    
    function test_OnlyOwnerCanSetTreasury() public {
        vm.prank(attacker);
        vm.expectRevert();
        escrow.setTreasuryAddress(makeAddr("newTreasury"));
    }
    
    function test_PauseAndUnpause() public {
        escrow.pause();
        assertTrue(escrow.paused());
        
        // Cannot deposit when paused
        vm.prank(buyer);
        vm.expectRevert();
        escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );
        
        escrow.unpause();
        assertFalse(escrow.paused());
    }
    
    // ============ Fee Calculation Tests ============
    
    function test_CalculateFees() public view {
        (uint256 platformFee, uint256 sellerPayout) = escrow.calculateFees(ESCROW_AMOUNT);
        
        assertEq(platformFee, ESCROW_AMOUNT * 250 / 10000); // 2.5%
        assertEq(sellerPayout, ESCROW_AMOUNT - platformFee);
        assertEq(platformFee + sellerPayout, ESCROW_AMOUNT);
    }
    
    function testFuzz_CalculateFees(uint256 amount) public view {
        vm.assume(amount > 0 && amount < type(uint256).max / 250);
        
        (uint256 platformFee, uint256 sellerPayout) = escrow.calculateFees(amount);
        
        assertEq(platformFee + sellerPayout, amount);
        assertLe(platformFee, amount * 250 / 10000);
    }

    // ============ Snapshot Tests ============

    function test_SnapshotCreation() public {
        // 1. Deposit Funds -> Should create Snapshot 0
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(
            LISTING_ID,
            ESCROW_AMOUNT,
            EscrowV1.EncryptionMethod.ECIES_WALLET
        );

        (uint256 bal0, EscrowV1.EscrowState state0, uint256 ts0) = escrow.history(escrowId, 0);
        assertEq(bal0, ESCROW_AMOUNT);
        assertEq(uint256(state0), uint256(EscrowV1.EscrowState.FUNDED));
        assertEq(ts0, block.timestamp);

        // 2. Upload Credentials -> Should create Snapshot 1
        bytes32 credHash = keccak256("encrypted_credentials");
        vm.prank(seller);
        escrow.uploadCredentialHash(escrowId, credHash);

        (uint256 bal1, EscrowV1.EscrowState state1, uint256 ts1) = escrow.history(escrowId, 1);
        assertEq(bal1, ESCROW_AMOUNT);
        assertEq(uint256(state1), uint256(EscrowV1.EscrowState.DELIVERED));
        assertEq(ts1, block.timestamp);

        // 3. Confirm Receipt -> Should create Snapshot 2
        vm.prank(buyer);
        escrow.confirmReceipt(escrowId);

        // After split: 
        // 90% released to seller immediately
        // 10% retained
        // So balance in contract for this escrow is effectively the retained amount? 
        // Note: The `balance` in snapshot logic uses `escrow.amount`.
        // Let's check `_snapshot`: 
        // balance: escrow.amount
        // `escrow.amount` is NOT updated during confirmReceipt in the current implementation of `EscrowV1.sol`. 
        // It stays as the original deposit amount.
        
        (uint256 bal2, EscrowV1.EscrowState state2, uint256 ts2) = escrow.history(escrowId, 2);
        assertEq(bal2, ESCROW_AMOUNT); // Validating that we capture the original amount as per current logic
        assertEq(uint256(state2), uint256(EscrowV1.EscrowState.TRANSITION));
        assertEq(ts2, block.timestamp);
    }
}
