// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/EscrowV1.sol";
import "../contracts/mocks/MockFeeToken.sol";
import "../contracts/mocks/MockMarketplace.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract EscrowV1FeeOnTransferTest is Test {
    EscrowV1 public escrowImplementation;
    EscrowV1 public escrow;
    MockFeeToken public feeToken;
    MockMarketplace public marketplace;
    
    address public owner;
    address public treasury;
    address public buyer;
    address public seller;
    
    uint256 constant LISTING_ID = 1;
    uint256 constant ESCROW_AMOUNT = 100_000_000 * 1e18;
    
    // Offer constants
    uint256 constant OFFER_PRICE = 90_000_000 * 1e18;

    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        buyer = makeAddr("buyer");
        seller = makeAddr("seller");
        
        feeToken = new MockFeeToken();
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
            address(feeToken),
            address(marketplace)
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(escrowImplementation),
            initData
        );
        
        escrow = EscrowV1(address(proxy));
        
        feeToken.mint(buyer, 1_000_000_000 * 1e18);
        vm.prank(buyer);
        feeToken.approve(address(escrow), type(uint256).max);
    }

    function test_DepositFunds_FoT() public {
        vm.prank(buyer);
        uint256 escrowId = escrow.depositFunds(LISTING_ID, ESCROW_AMOUNT, EscrowV1.EncryptionMethod.ECIES_WALLET);

        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(escrowId);
        
        // Fee is 1%
        uint256 expectedAmount = ESCROW_AMOUNT * 99 / 100;
        
        assertEq(txn.amount, expectedAmount, "Escrow amount should be net of tax");
        assertEq(txn.totalFunded, expectedAmount, "Total funded should match actual received");
    }

    function test_MakeOffer_FoT() public {
        vm.prank(buyer);
        escrow.makeOffer(LISTING_ID, OFFER_PRICE);
        
        (,,, uint256 price, uint256 deposit,,,,) = escrow.offers(1);
        
        uint256 initialDeposit = OFFER_PRICE / 100; // 1%
        uint256 expectedDeposit = initialDeposit * 99 / 100; // Then taxed 1%
        
        assertEq(price, OFFER_PRICE);
        assertEq(deposit, expectedDeposit, "Deposit should be net of tax");
    }

    function test_CompleteFunding_FoT() public {
        // 1. Make Offer
        vm.prank(buyer);
        escrow.makeOffer(LISTING_ID, OFFER_PRICE);
        
        // 2. Accept Offer
        vm.prank(seller);
        escrow.acceptOffer(1, EscrowV1.EncryptionMethod.ECIES_WALLET);
        
        EscrowV1.EscrowTransaction memory txn = escrow.getEscrow(1);
        uint256 initialDeposit = OFFER_PRICE / 100;
        uint256 expectedDeposit = initialDeposit * 99 / 100;
        assertEq(txn.totalFunded, expectedDeposit);

        // 3. Complete Funding
        vm.prank(buyer);
        escrow.completeFunding(1);
        
        txn = escrow.getEscrow(1);
        
        // Remaining was (Amount - TotalFunded) requested
        // But amount in escrow struct is OFFER_PRICE (contract logic for acceptOffer kept original price?)
        // Wait, acceptOffer logic:
        // amount: offer.offerPrice
        // This is tricky. If we accepted offer price P, we expect P to be funded?
        // But we only receive P * 0.99.
        // So `escrow.amount` is P.
        // `totalFunded` will eventually be P * 0.99 (approx). 
        // Logic says: remaining = escrow.amount - escrow.totalFunded.
        // Buyer sends remaining. Net received is remaining * 0.99.
        // totalFunded += remaining * 0.99.
        // Final totalFunded < escrow.amount.
        // Does this matter?
        // It matters if we check `totalFunded >= amount` somewhere.
        // We do: `require(remainingAmount > 0, "Already fully funded");` in completeFunding.
        // But we don't block operations if underfunded?
        // `Funded` state is set.
        // BUT logic for payout uses `escrow.amount`?
        // `calculateFees` for offers uses `offer.offerPrice`.
        // `sellerPayout` is based on `offer.offerPrice`.
        // If we only have `offerPrice * 0.99` in contract, and we try to pay out `sellerPayout`, we might revert if `sellerPayout + platformFee > balance`.
        // This is a potential bug or feature of FoT support.
        // If we want to support FoT, we should rely on `idrxToken.transfer` failing if we don't have enough.
        // If we allow `totalFunded < amount`, we will fail to pay seller.
        // So for Offers, we might need to adjust `escrow.amount` to actual funded?
        // Or Buyer needs to overpay?
        // For now, let's see if the test passes or if we identifying a shortfall in `acceptOffer` logic which didn't use actuals because it didn't transfer.
        
        // Actually, `acceptOffer` sets `escrow.amount = offer.offerPrice`.
        // So `escrow` expects 100% of price.
        // But we physically only receive 99%.
        // The contract will be insolvent by 1%.
        // Correct fix: In `acceptOffer`, use what? We haven't transferred the main bulk yet.
        // The offer price is the AGREED price.
        // Use case: Buyer offers 90M. Seller accepts.
        // Contract attempts to facilitate 90M.
        // Fees take 2.5% -> 87.75M to Seller.
        // Token tax takes 1% on INGRESS.
        // Contract receives 89.1M total.
        // Needs to pay out 87.75M + 2.25M = 90M.
        // Shortfall 0.9M.
        // Transaction fails on exit.
        
        // Conclusion: For FoT, `escrow.amount` should likely track `totalFunded`.
        // OR `sellerPayout` must be recalculated based on `totalFunded` at the end?
        // But `sellerPayout` is set at creation.
        
        // Strategy: In `completeFunding`, we update `escrow.sellerPayout`? No, that's messy.
        // Better: In `makeOffer` / `completeFunding`, the buyer is "paying" a price.
        // If the token is FoT, the "Effective Price" is lower.
        // Maybe we just let it fail for now if it's insolvent, OR we verify it.
        // The task is "Implement Fee-on-Transfer Support". 
        // Simple support: `depositFunds` lowers `escrow.amount` to actual. That works for direct buy.
        // For Offer: `escrow.amount` is set to `offerPrice`. That is the bug.
        // The `escrow.amount` in `acceptOffer` should surely be ... what?
        // We don't know the future tax.
        // We know we have a deposit.
        // When `completeFunding` happens, we get more.
        // Maybe we should update `escrow.amount` at `completeFunding`?
        // `escrow.amount = escrow.totalFunded`.
        // `(fee, payout) = calculateFees(escrow.amount)`.
        
        // Let's modify `EscrowV1.sol` logic for `completeFunding` to update amounts.
        // Current logic in `completeFunding` adds to `totalFunded`.
        // If `escrow.state` becomes `FUNDED`, we should probably re-calculate fees based on `totalFunded`?
        // Or just `escrow.amount = escrow.totalFunded`.
        // Let's add that to the checks.
        
        // For this test, verifying the calculation is key.
    }
}
