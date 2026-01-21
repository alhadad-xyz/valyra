// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IMarketplace {
    enum ListingState {
        ACTIVE, // Available for purchase
        PENDING, // Buyer has deposited, awaiting handover
        COMPLETED, // Transaction successful
        CANCELLED, // Seller cancelled
        DISPUTED, // Under dispute
        PAUSED // Health check failed
    }

    struct Listing {
        uint256 id;
        address seller;
        string title;
        string ipfsMetadata;
        uint256 askingPrice;
        uint256 createdAt;
        uint8 verificationLevel; // Using uint8 to avoid importing VerificationLevel enum if not needed, or we can copy it. Simplest is to map to the struct structure.
        ListingState state;
        bytes32 ipAssignmentHash;
        bytes sellerSignature;
        uint256 ipSignedAt;
        string buildId;
        bool buildIdVerified;
    }

    function listings(
        uint256 listingId
    )
        external
        view
        returns (
            uint256 id,
            address seller,
            string memory title,
            string memory ipfsMetadata,
            uint256 askingPrice,
            uint256 createdAt,
            uint8 verificationLevel, // Enums are uint8
            ListingState state,
            bytes32 ipAssignmentHash,
            bytes memory sellerSignature,
            uint256 ipSignedAt,
            string memory buildId,
            bool buildIdVerified
        );
}

/**
 * @title EscrowV1
 * @dev Core escrow contract for managing fund locking, credential handover, and dispute resolution
 * @notice Implements UUPS upgradeable pattern for contract upgrades while preserving state
 */
contract EscrowV1 is
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable,
    ReentrancyGuard,
    UUPSUpgradeable
{
    // ============ Enums ============

    enum EscrowState {
        CREATED, // Escrow created, awaiting deposit
        FUNDED, // Buyer deposited IDRX
        DELIVERED, // Seller uploaded credentials
        CONFIRMED, // Buyer confirmed receipt
        TRANSITION, // Transition hold period (10% retained)
        DISPUTED, // Dispute raised
        RESOLVED, // Dispute resolved by arbitration
        COMPLETED, // Funds fully released to seller
        REFUNDED, // Funds returned to buyer
        EXPIRED, // Timeouts triggered refund
        EMERGENCY // Emergency eject triggered
    }

    enum EncryptionMethod {
        ECIES_WALLET, // Standard ECIES with wallet public key
        EPHEMERAL_KEYPAIR // Fallback for Smart Wallets (IndexedDB storage)
    }

    enum DisputeType {
        CREDENTIAL_MISMATCH, // Credentials don't work
        METRIC_FRAUD, // Revenue/traffic was fake
        NON_DELIVERY, // Seller didn't provide credentials
        QUALITY_DISPUTE // Business not as described
    }

    enum DisputeResolution {
        PENDING,
        FULL_REFUND,
        PARTIAL_REFUND,
        RELEASE_TO_SELLER,
        SPLIT
    }

    enum OfferState {
        ACTIVE,
        ACCEPTED,
        REJECTED,
        CANCELLED
    }

    // ============ Structs ============

    struct EscrowTransaction {
        uint256 id;
        uint256 listingId;
        address buyer;
        address seller;
        uint256 amount; // IDRX amount (before fees)
        uint256 platformFee; // 2.5% platform fee
        uint256 sellerPayout; // amount - platformFee
        uint256 depositedAt;
        uint256 handoverDeadline; // Seller must upload credentials by this time
        uint256 verifyDeadline; // Buyer must confirm or dispute by this time
        bytes32 credentialHash; // Hash of encrypted credentials
        EscrowState state;
        EncryptionMethod encryptionMethod;
        bool verifyExtensionUsed; // One-time 24h extension used
        uint256 totalFunded; // Amount funded so far (for offer flow)
    }

    struct TransitionHold {
        uint256 escrowId;
        uint256 retainedAmount; // 10% of seller payout
        uint256 releaseTime; // 7 days after CONFIRMED
        bool isReleased; // Whether retainer was released
        bool isClaimed; // Whether seller claimed the retainer
        string assistanceNotes; // Optional notes about transition help
    }

    struct Dispute {
        uint256 escrowId;
        address initiator;
        DisputeType disputeType;
        string evidenceIpfs; // IPFS hash of ENCRYPTED evidence
        string responseIpfs; // Seller's counter-evidence
        uint256 createdAt;
        uint256 responseDeadline;
        DisputeResolution resolution;
        address resolver; // Admin who resolved
    }

    struct Offer {
        uint256 id;
        uint256 listingId;
        address buyer;
        uint256 offerPrice;
        uint256 depositAmount; // 5% of offerPrice
        uint256 timestamp;
        uint256 expiresAt; // Offer expires 24h after creation
        OfferState state;
        uint256 escrowId; // ID of created escrow if accepted
    }

    // ============ State Variables ============

    IERC20 public idrxToken;
    address public treasuryAddress;
    address public marketplaceAddress;

    uint256 public escrowCounter;
    mapping(uint256 => EscrowTransaction) public escrows;
    mapping(uint256 => TransitionHold) public transitionHolds;
    mapping(uint256 => Dispute) public disputes;

    uint256 public offerCounter;
    mapping(uint256 => Offer) public offers;

    // Track active offers: listingId => buyer => offerId
    mapping(uint256 => mapping(address => uint256))
        public activeOffersByBuyerAndListing;

    address public safetyWallet;

    // Emergency mode
    bool public emergencyMode;
    uint256 public emergencyActivatedAt;

    // Transition Config
    uint256 public transitionPeriod;

    // ============ Constants ============

    uint256 public constant PLATFORM_FEE_BPS = 250; // 2.5% = 250 basis points
    uint256 public constant TRANSITION_RETAINER_BPS = 1000; // 10%
    uint256 public constant EARNEST_DEPOSIT_BPS = 500; // 5% earnest money deposit
    uint256 public constant OFFER_EXPIRY_WINDOW = 24 hours; // Offers expire after 24 hours
    uint256 public constant HANDOVER_DEADLINE = 72 hours;
    uint256 public constant VERIFICATION_WINDOW = 72 hours;
    uint256 public constant EXTENSION_PERIOD = 24 hours;
    uint256 public constant DEFAULT_TRANSITION_PERIOD = 7 days;
    uint256 public constant EMERGENCY_COOLDOWN = 72 hours;
    uint256 public constant DISPUTE_RESPONSE_WINDOW = 48 hours;

    // ============ Events ============

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
        EncryptionMethod encryptionMethod
    );

    event CredentialsUploaded(uint256 indexed escrowId, bytes32 credentialHash);

    event ReceiptConfirmed(
        uint256 indexed escrowId,
        uint256 immediateRelease,
        uint256 retainerAmount
    );

    event FundsReleased(
        uint256 indexed escrowId,
        address indexed seller,
        uint256 sellerPayout,
        uint256 platformFee
    );

    event TransitionHoldCreated(
        uint256 indexed escrowId,
        uint256 retainedAmount,
        uint256 releaseTime
    );

    event TransitionRetainerClaimed(uint256 indexed escrowId, uint256 amount);

    event TransitionIssueReported(uint256 indexed escrowId, string issue);

    event TransitionPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);

    event AdminRetainerReleased(
        uint256 indexed escrowId,
        address indexed seller,
        uint256 amount
    );

    event DisputeRaised(
        uint256 indexed escrowId,
        address indexed initiator,
        DisputeType disputeType,
        string evidenceIpfs
    );

    event DisputeResponded(uint256 indexed escrowId, string responseIpfs);

    event DisputeResolved(
        uint256 indexed escrowId,
        DisputeResolution resolution,
        address resolver
    );

    event VerificationExtended(uint256 indexed escrowId, uint256 newDeadline);

    event TimeoutClaimed(uint256 indexed escrowId, EscrowState newState);

    event EmergencyActivated(uint256 timestamp);
    event EmergencyDeactivated();
    event EmergencyWithdrawal(
        uint256 indexed escrowId,
        address indexed claimer
    );

    event TreasuryAddressUpdated(
        address indexed oldTreasury,
        address indexed newTreasury
    );

    // ============ Offer Events ============

    event OfferMade(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed buyer,
        uint256 offerPrice,
        uint256 depositAmount
    );

    event OfferAccepted(
        uint256 indexed offerId,
        uint256 indexed escrowId,
        uint256 listingId,
        address buyer,
        address seller,
        uint256 amount
    );

    event OfferRejected(uint256 indexed offerId);

    event OfferCancelled(uint256 indexed offerId);

    event SafetyWalletUpdated(
        address indexed oldSafety,
        address indexed newSafety
    );

    event EmergencyEjectEscrow(
        uint256 indexed escrowId,
        uint256 amount,
        address indexed safetyWallet
    );

    event EmergencyEjectOffer(
        uint256 indexed offerId,
        uint256 amount,
        address indexed safetyWallet
    );

    // ============ Modifiers ============

    modifier onlyBuyer(uint256 escrowId) {
        require(
            msg.sender == escrows[escrowId].buyer,
            "Only buyer can call this function"
        );
        _;
    }

    modifier onlySeller(uint256 escrowId) {
        require(
            msg.sender == escrows[escrowId].seller,
            "Only seller can call this function"
        );
        _;
    }

    modifier escrowExists(uint256 escrowId) {
        require(escrows[escrowId].id == escrowId, "Escrow does not exist");
        _;
    }

    // ============ Initializer ============

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract with treasury and IDRX token addresses
     * @param _treasuryAddress Address to receive platform fees
     * @param _idrxToken Address of the IDRX token contract
     */
    function initialize(
        address _treasuryAddress,
        address _idrxToken,
        address _marketplaceAddress
    ) public initializer {
        require(_treasuryAddress != address(0), "Invalid treasury address");
        require(_idrxToken != address(0), "Invalid IDRX token address");
        require(
            _marketplaceAddress != address(0),
            "Invalid marketplace address"
        );

        __Ownable_init(msg.sender);
        __Pausable_init();

        treasuryAddress = _treasuryAddress;
        idrxToken = IERC20(_idrxToken);
        marketplaceAddress = _marketplaceAddress;
        escrowCounter = 0;
        emergencyMode = false;
    }

    // ============ UUPS Upgrade Authorization ============

    /**
     * @dev Function that should revert when `msg.sender` is not authorized to upgrade the contract
     * @param newImplementation Address of the new implementation
     */
    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    // ============ Core Escrow Functions ============

    /**
     * @dev Creates and funds a new escrow transaction
     * @param listingId ID of the listing being purchased
     * @param amount Amount in IDRX (including fees)
     * @param encryptionMethod Method used for credential encryption
     */
    function depositFunds(
        uint256 listingId,
        uint256 amount,
        EncryptionMethod encryptionMethod
    ) external whenNotPaused nonReentrant returns (uint256 escrowId) {
        // Fetch listing details from marketplace
        (
            ,
            address seller,
            ,
            ,
            uint256 askingPrice,
            ,
            ,
            IMarketplace.ListingState state,
            ,
            ,
            ,
            ,

        ) = IMarketplace(marketplaceAddress).listings(listingId);

        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Buyer cannot be seller");
        require(amount > 0, "Amount must be greater than 0");
        require(amount == askingPrice, "Amount must match listing price");
        require(
            state == IMarketplace.ListingState.ACTIVE,
            "Listing not active"
        );

        // Transfer IDRX from buyer to this contract
        uint256 balanceBefore = idrxToken.balanceOf(address(this));
        require(
            idrxToken.transferFrom(msg.sender, address(this), amount),
            "IDRX transfer failed"
        );
        uint256 actualReceived = idrxToken.balanceOf(address(this)) -
            balanceBefore;

        // Calculate fees based on actual received amount
        (uint256 platformFee, uint256 sellerPayout) = calculateFees(
            actualReceived
        );

        // Create escrow
        escrowId = ++escrowCounter;
        escrows[escrowId] = EscrowTransaction({
            id: escrowId,
            listingId: listingId,
            buyer: msg.sender,
            seller: seller,
            amount: actualReceived,
            platformFee: platformFee,
            sellerPayout: sellerPayout,
            depositedAt: block.timestamp,
            handoverDeadline: block.timestamp + HANDOVER_DEADLINE,
            verifyDeadline: 0, // Set when credentials are uploaded
            credentialHash: bytes32(0),
            state: EscrowState.FUNDED,
            encryptionMethod: encryptionMethod,
            verifyExtensionUsed: false,
            totalFunded: actualReceived // Fully funded immediately with actual amount
        });

        emit EscrowCreated(
            escrowId,
            listingId,
            msg.sender,
            seller,
            actualReceived
        );
        emit FundsDeposited(
            escrowId,
            msg.sender,
            actualReceived,
            encryptionMethod
        );

        _snapshot(escrowId);
    }

    /**
     * @dev Seller uploads hash of encrypted credentials
     * @param escrowId ID of the escrow transaction
     * @param credentialHash Hash of the encrypted credentials
     */
    function uploadCredentialHash(
        uint256 escrowId,
        bytes32 credentialHash
    )
        external
        whenNotPaused
        escrowExists(escrowId)
        onlySeller(escrowId)
        nonReentrant
    {
        EscrowTransaction storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.FUNDED, "Invalid escrow state");
        require(
            block.timestamp <= escrow.handoverDeadline,
            "Handover deadline passed"
        );
        require(credentialHash != bytes32(0), "Invalid credential hash");

        escrow.credentialHash = credentialHash;
        escrow.verifyDeadline = block.timestamp + VERIFICATION_WINDOW;
        escrow.state = EscrowState.DELIVERED;

        emit CredentialsUploaded(escrowId, credentialHash);

        _snapshot(escrowId);
    }

    /**
     * @dev Buyer confirms receipt of credentials (triggers 90/10 split)
     * @param escrowId ID of the escrow transaction
     */
    function confirmReceipt(
        uint256 escrowId
    )
        external
        whenNotPaused
        escrowExists(escrowId)
        onlyBuyer(escrowId)
        nonReentrant
    {
        EscrowTransaction storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.DELIVERED, "Invalid escrow state");
        require(
            block.timestamp <= escrow.verifyDeadline,
            "Verification deadline passed"
        );

        // Calculate split: 90% now, 10% retainer
        uint256 retainer = (escrow.sellerPayout * TRANSITION_RETAINER_BPS) /
            10000;
        uint256 immediateRelease = escrow.sellerPayout - retainer;

        // Release 90% immediately to seller
        require(
            idrxToken.transfer(escrow.seller, immediateRelease),
            "Transfer to seller failed"
        );

        // Transfer platform fee to treasury
        require(
            idrxToken.transfer(treasuryAddress, escrow.platformFee),
            "Transfer to treasury failed"
        );

        // Create transition hold for 10%
        transitionHolds[escrowId] = TransitionHold({
            escrowId: escrowId,
            retainedAmount: retainer,
            releaseTime: block.timestamp + transitionPeriod,
            isReleased: false,
            isClaimed: false,
            assistanceNotes: ""
        });

        escrow.state = EscrowState.TRANSITION;

        emit ReceiptConfirmed(escrowId, immediateRelease, retainer);
        emit FundsReleased(
            escrowId,
            escrow.seller,
            immediateRelease,
            escrow.platformFee
        );
        emit TransitionHoldCreated(
            escrowId,
            retainer,
            block.timestamp + transitionPeriod
        );

        _snapshot(escrowId);
    }

    /**
     * @dev Seller claims the 10% transition retainer after 7 days
     * @param escrowId ID of the escrow transaction
     */
    function claimTransitionRetainer(
        uint256 escrowId
    )
        external
        whenNotPaused
        escrowExists(escrowId)
        onlySeller(escrowId)
        nonReentrant
    {
        EscrowTransaction storage escrow = escrows[escrowId];
        TransitionHold storage hold = transitionHolds[escrowId];

        require(escrow.state == EscrowState.TRANSITION, "Invalid escrow state");
        require(!hold.isClaimed, "Retainer already claimed");
        require(
            block.timestamp >= hold.releaseTime,
            "Transition period not ended"
        );

        hold.isClaimed = true;
        hold.isReleased = true;

        require(
            idrxToken.transfer(escrow.seller, hold.retainedAmount),
            "Transfer failed"
        );

        escrow.state = EscrowState.COMPLETED;

        emit TransitionRetainerClaimed(escrowId, hold.retainedAmount);

        _snapshot(escrowId);
    }

    /**
     * @dev Buyer reports transition issues (extends hold, triggers dispute)
     * @param escrowId ID of the escrow transaction
     * @param issue Description of the transition issue
     */
    function reportTransitionIssue(
        uint256 escrowId,
        string memory issue
    ) external whenNotPaused escrowExists(escrowId) onlyBuyer(escrowId) {
        EscrowTransaction storage escrow = escrows[escrowId];
        TransitionHold storage hold = transitionHolds[escrowId];

        require(escrow.state == EscrowState.TRANSITION, "Invalid escrow state");
        require(block.timestamp < hold.releaseTime, "Transition period ended");
        require(bytes(issue).length > 0, "Issue description required");

        hold.assistanceNotes = issue;
        escrow.state = EscrowState.DISPUTED;

        emit TransitionIssueReported(escrowId, issue);

        _snapshot(escrowId);
    }

    /**
     * @dev Request one-time 24h verification extension
     * @param escrowId ID of the escrow transaction
     */
    function requestVerificationExtension(
        uint256 escrowId
    ) external whenNotPaused escrowExists(escrowId) onlyBuyer(escrowId) {
        EscrowTransaction storage escrow = escrows[escrowId];

        require(escrow.state == EscrowState.DELIVERED, "Invalid escrow state");
        require(!escrow.verifyExtensionUsed, "Extension already used");
        require(
            block.timestamp < escrow.verifyDeadline,
            "Deadline already passed"
        );

        escrow.verifyExtensionUsed = true;
        escrow.verifyDeadline += EXTENSION_PERIOD;

        emit VerificationExtended(escrowId, escrow.verifyDeadline);

        _snapshot(escrowId);
    }

    // ============ Offer Functions ============

    /**
     * @dev Make a binding offer on a listing with a 5% earnest deposit
     * @param listingId ID of the listing
     * @param offerPrice Proposed price in IDRX
     */
    function makeOffer(
        uint256 listingId,
        uint256 offerPrice
    ) external whenNotPaused nonReentrant {
        // Check for existing active offer
        require(
            activeOffersByBuyerAndListing[listingId][msg.sender] == 0,
            "Active offer already exists for this listing"
        );

        // Fetch listing details
        (
            ,
            address seller,
            ,
            ,
            ,
            ,
            ,
            IMarketplace.ListingState state,
            ,
            ,
            ,
            ,

        ) = IMarketplace(marketplaceAddress).listings(listingId);

        require(seller != address(0), "Invalid seller address");
        require(seller != msg.sender, "Buyer cannot be seller");
        require(offerPrice > 0, "Price must be greater than 0");
        require(
            state == IMarketplace.ListingState.ACTIVE,
            "Listing not active"
        );

        // Calculate 5% earnest deposit
        uint256 depositAmount = (offerPrice * EARNEST_DEPOSIT_BPS) / 10000;

        // Transfer deposit
        uint256 balanceBefore = idrxToken.balanceOf(address(this));
        require(
            idrxToken.transferFrom(msg.sender, address(this), depositAmount),
            "Deposit transfer failed"
        );
        uint256 actualDeposit = idrxToken.balanceOf(address(this)) -
            balanceBefore;

        // Create offer
        uint256 offerId = ++offerCounter;
        offers[offerId] = Offer({
            id: offerId,
            listingId: listingId,
            buyer: msg.sender,
            offerPrice: offerPrice,
            depositAmount: actualDeposit, // Track actual deposit
            timestamp: block.timestamp,
            expiresAt: block.timestamp + OFFER_EXPIRY_WINDOW,
            state: OfferState.ACTIVE,
            escrowId: 0
        });

        // Track active offer
        activeOffersByBuyerAndListing[listingId][msg.sender] = offerId;

        emit OfferMade(
            offerId,
            listingId,
            msg.sender,
            offerPrice,
            actualDeposit
        );
    }

    /**
     * @dev Accept an offer (Seller only) -> Creates Escrow
     * @param offerId ID of the offer
     * @param encryptionMethod Encryption method for the resulting escrow
     */
    function acceptOffer(
        uint256 offerId,
        EncryptionMethod encryptionMethod
    ) external whenNotPaused nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.state == OfferState.ACTIVE, "Offer not active");

        // Verify seller
        (, address seller, , , , , , , , , , , ) = IMarketplace(
            marketplaceAddress
        ).listings(offer.listingId);
        require(msg.sender == seller, "Only seller can accept");

        // Update Offer State
        offer.state = OfferState.ACCEPTED;

        // Clear active offer tracking
        delete activeOffersByBuyerAndListing[offer.listingId][offer.buyer];

        // Calculate fees based on OFFER PRICE
        (uint256 platformFee, uint256 sellerPayout) = calculateFees(
            offer.offerPrice
        );

        // Create Escrow
        uint256 escrowId = ++escrowCounter;
        escrows[escrowId] = EscrowTransaction({
            id: escrowId,
            listingId: offer.listingId,
            buyer: offer.buyer,
            seller: seller,
            amount: offer.offerPrice,
            platformFee: platformFee,
            sellerPayout: sellerPayout,
            depositedAt: block.timestamp,
            handoverDeadline: block.timestamp + HANDOVER_DEADLINE,
            verifyDeadline: 0,
            credentialHash: bytes32(0),
            state: EscrowState.CREATED, // Awaiting full funding
            encryptionMethod: encryptionMethod,
            verifyExtensionUsed: false,
            totalFunded: offer.depositAmount // Initially funded with deposit
        });

        offer.escrowId = escrowId;

        emit OfferAccepted(
            offerId,
            escrowId,
            offer.listingId,
            offer.buyer,
            seller,
            offer.offerPrice
        );
        emit EscrowCreated(
            escrowId,
            offer.listingId,
            offer.buyer,
            seller,
            offer.offerPrice
        );

        _snapshot(escrowId);
    }

    /**
     * @dev Reject an offer (Seller only) -> Refunds deposit
     * @param offerId ID of the offer
     */
    function rejectOffer(uint256 offerId) external whenNotPaused nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.state == OfferState.ACTIVE, "Offer not active");

        // Verify seller
        (, address seller, , , , , , , , , , , ) = IMarketplace(
            marketplaceAddress
        ).listings(offer.listingId);
        require(msg.sender == seller, "Only seller can reject");

        offer.state = OfferState.REJECTED;

        // Clear active offer tracking
        delete activeOffersByBuyerAndListing[offer.listingId][offer.buyer];

        // Refund deposit
        require(
            idrxToken.transfer(offer.buyer, offer.depositAmount),
            "Refund failed"
        );
        emit OfferRejected(offerId);
    }

    /**
     * @dev Cancel an offer (Buyer only, or anyone after expiry) -> Refunds deposit
     * @param offerId ID of the offer
     */
    function cancelOffer(uint256 offerId) external whenNotPaused nonReentrant {
        Offer storage offer = offers[offerId];
        require(offer.state == OfferState.ACTIVE, "Offer not active");

        // Allow buyer to cancel anytime, or anyone to cancel after expiry
        bool isExpired = block.timestamp > offer.expiresAt;
        require(
            msg.sender == offer.buyer || isExpired,
            "Only buyer can cancel before expiry"
        );

        offer.state = OfferState.CANCELLED;

        // Clear active offer tracking
        delete activeOffersByBuyerAndListing[offer.listingId][offer.buyer];

        // Refund deposit
        require(
            idrxToken.transfer(offer.buyer, offer.depositAmount),
            "Refund failed"
        );

        emit OfferCancelled(offerId);
    }

    /**
     * @dev Buyer completes funding for an accepted offer
     * @param escrowId ID of the escrow
     */
    function completeFunding(
        uint256 escrowId
    ) external whenNotPaused nonReentrant {
        EscrowTransaction storage escrow = escrows[escrowId];
        require(escrow.state == EscrowState.CREATED, "Invalid escrow state");
        require(msg.sender == escrow.buyer, "Only buyer can fund");

        uint256 remainingAmount = escrow.amount - escrow.totalFunded;
        require(remainingAmount > 0, "Already fully funded");

        // Transfer remaining
        uint256 balanceBefore = idrxToken.balanceOf(address(this));
        require(
            idrxToken.transferFrom(msg.sender, address(this), remainingAmount),
            "Transfer failed"
        );
        uint256 actualReceived = idrxToken.balanceOf(address(this)) -
            balanceBefore;

        escrow.totalFunded += actualReceived;

        // Recalibrate escrow amount and fees to match actual funded amount logic (handling taxes)
        // Since we claimed it was funded, we should base payouts on what we actually have.
        escrow.amount = escrow.totalFunded;
        (escrow.platformFee, escrow.sellerPayout) = calculateFees(
            escrow.amount
        );

        escrow.state = EscrowState.FUNDED;

        emit FundsDeposited(
            escrowId,
            msg.sender,
            escrow.amount,
            escrow.encryptionMethod
        );
        // Note: FundsDeposited usually implies full amount for start.
        // We can emit it here signifying "Funding Complete".

        _snapshot(escrowId);
    }

    // ============ Dispute Functions ============

    /**
     * @dev Raise a dispute on an escrow transaction
     * @param escrowId ID of the escrow transaction
     * @param disputeType Type of dispute
     * @param evidenceIpfs IPFS hash of encrypted evidence
     */
    function raiseDispute(
        uint256 escrowId,
        DisputeType disputeType,
        string memory evidenceIpfs
    ) external whenNotPaused escrowExists(escrowId) {
        EscrowTransaction storage escrow = escrows[escrowId];

        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Only buyer or seller can raise dispute"
        );
        require(
            escrow.state == EscrowState.DELIVERED ||
                escrow.state == EscrowState.TRANSITION,
            "Invalid escrow state for dispute"
        );
        require(bytes(evidenceIpfs).length > 0, "Evidence required");

        disputes[escrowId] = Dispute({
            escrowId: escrowId,
            initiator: msg.sender,
            disputeType: disputeType,
            evidenceIpfs: evidenceIpfs,
            responseIpfs: "",
            createdAt: block.timestamp,
            responseDeadline: block.timestamp + DISPUTE_RESPONSE_WINDOW,
            resolution: DisputeResolution.PENDING,
            resolver: address(0)
        });

        escrow.state = EscrowState.DISPUTED;

        emit DisputeRaised(escrowId, msg.sender, disputeType, evidenceIpfs);

        _snapshot(escrowId);
    }

    /**
     * @dev Respond to a dispute with counter-evidence
     * @param escrowId ID of the escrow transaction
     * @param responseIpfs IPFS hash of response evidence
     */
    function respondToDispute(
        uint256 escrowId,
        string memory responseIpfs
    ) external whenNotPaused escrowExists(escrowId) {
        EscrowTransaction storage escrow = escrows[escrowId];
        Dispute storage dispute = disputes[escrowId];

        require(escrow.state == EscrowState.DISPUTED, "No active dispute");
        require(
            msg.sender == escrow.buyer || msg.sender == escrow.seller,
            "Only buyer or seller can respond"
        );
        require(msg.sender != dispute.initiator, "Initiator cannot respond");
        require(
            block.timestamp <= dispute.responseDeadline,
            "Response deadline passed"
        );
        require(bytes(responseIpfs).length > 0, "Response required");

        dispute.responseIpfs = responseIpfs;

        emit DisputeResponded(escrowId, responseIpfs);
    }

    /**
     * @dev Resolve a dispute (centralized for MVP)
     * @param escrowId ID of the escrow transaction
     * @param resolution Resolution type
     * @param refundPercent Percentage to refund (0-10000 basis points)
     */
    function resolveDispute(
        uint256 escrowId,
        DisputeResolution resolution,
        uint256 refundPercent
    ) external onlyOwner escrowExists(escrowId) nonReentrant {
        EscrowTransaction storage escrow = escrows[escrowId];
        Dispute storage dispute = disputes[escrowId];

        require(escrow.state == EscrowState.DISPUTED, "No active dispute");
        require(resolution != DisputeResolution.PENDING, "Invalid resolution");
        require(refundPercent <= 10000, "Invalid refund percentage");

        dispute.resolution = resolution;
        dispute.resolver = msg.sender;

        if (resolution == DisputeResolution.FULL_REFUND) {
            // Return all funds to buyer
            require(
                idrxToken.transfer(escrow.buyer, escrow.amount),
                "Refund failed"
            );
            escrow.state = EscrowState.REFUNDED;
        } else if (resolution == DisputeResolution.RELEASE_TO_SELLER) {
            // Release all to seller (minus platform fee)
            require(
                idrxToken.transfer(escrow.seller, escrow.sellerPayout),
                "Transfer to seller failed"
            );
            require(
                idrxToken.transfer(treasuryAddress, escrow.platformFee),
                "Transfer to treasury failed"
            );
            escrow.state = EscrowState.COMPLETED;
        } else if (
            resolution == DisputeResolution.PARTIAL_REFUND ||
            resolution == DisputeResolution.SPLIT
        ) {
            // Calculate split based on refundPercent
            uint256 refundAmount = (escrow.amount * refundPercent) / 10000;
            uint256 sellerAmount = escrow.amount -
                refundAmount -
                escrow.platformFee;

            if (refundAmount > 0) {
                require(
                    idrxToken.transfer(escrow.buyer, refundAmount),
                    "Refund failed"
                );
            }
            if (sellerAmount > 0) {
                require(
                    idrxToken.transfer(escrow.seller, sellerAmount),
                    "Transfer to seller failed"
                );
            }
            require(
                idrxToken.transfer(treasuryAddress, escrow.platformFee),
                "Transfer to treasury failed"
            );
            escrow.state = EscrowState.RESOLVED;
        }

        emit DisputeResolved(escrowId, resolution, msg.sender);

        _snapshot(escrowId);
    }

    // ============ Timeout Functions ============

    /**
     * @dev Claim timeout refund or release based on current state
     * @param escrowId ID of the escrow transaction
     */
    function claimTimeout(
        uint256 escrowId
    ) external whenNotPaused escrowExists(escrowId) nonReentrant {
        EscrowTransaction storage escrow = escrows[escrowId];

        if (escrow.state == EscrowState.FUNDED) {
            // Seller didn't upload credentials in time - refund buyer
            require(
                block.timestamp > escrow.handoverDeadline,
                "Handover deadline not passed"
            );

            require(
                idrxToken.transfer(escrow.buyer, escrow.amount),
                "Refund failed"
            );

            escrow.state = EscrowState.EXPIRED;
            emit TimeoutClaimed(escrowId, EscrowState.EXPIRED);
            _snapshot(escrowId);
        } else if (escrow.state == EscrowState.DELIVERED) {
            // Buyer didn't confirm in time - auto-release to seller
            require(
                block.timestamp > escrow.verifyDeadline,
                "Verification deadline not passed"
            );

            require(
                idrxToken.transfer(escrow.seller, escrow.sellerPayout),
                "Transfer to seller failed"
            );
            require(
                idrxToken.transfer(treasuryAddress, escrow.platformFee),
                "Transfer to treasury failed"
            );

            escrow.state = EscrowState.COMPLETED;
            emit TimeoutClaimed(escrowId, EscrowState.COMPLETED);
            _snapshot(escrowId);
        } else {
            revert("No timeout applicable for current state");
        }
    }

    // ============ Emergency Functions ============

    /**
     * @dev Activate emergency mode (owner only)
     */
    function activateEmergency() external onlyOwner {
        require(!emergencyMode, "Emergency already active");

        emergencyMode = true;
        emergencyActivatedAt = block.timestamp;

        emit EmergencyActivated(block.timestamp);
    }

    /**
     * @dev Deactivate emergency mode (owner only, must be within cooldown)
     */
    function deactivateEmergency() external onlyOwner {
        require(emergencyMode, "Emergency not active");
        require(
            block.timestamp < emergencyActivatedAt + EMERGENCY_COOLDOWN,
            "Too late to cancel"
        );

        emergencyMode = false;

        emit EmergencyDeactivated();
    }

    /**
     * @dev Emergency withdrawal of funds (after cooldown)
     * @param escrowId ID of the escrow transaction
     */
    function emergencyWithdraw(
        uint256 escrowId
    ) external escrowExists(escrowId) nonReentrant {
        require(emergencyMode, "Not in emergency mode");
        require(
            block.timestamp >= emergencyActivatedAt + EMERGENCY_COOLDOWN,
            "Cooldown active"
        );

        EscrowTransaction storage escrow = escrows[escrowId];

        // Return funds to original owners based on state
        if (
            escrow.state == EscrowState.FUNDED ||
            escrow.state == EscrowState.DELIVERED
        ) {
            // Funds go back to buyer (they haven't confirmed yet)
            require(msg.sender == escrow.buyer, "Only buyer can withdraw");
            require(
                idrxToken.transfer(escrow.buyer, escrow.amount),
                "Transfer failed"
            );
        } else if (escrow.state == EscrowState.TRANSITION) {
            // Retainer goes to seller (buyer already has the asset)
            require(msg.sender == escrow.seller, "Only seller can withdraw");
            TransitionHold storage hold = transitionHolds[escrowId];
            require(
                idrxToken.transfer(escrow.seller, hold.retainedAmount),
                "Transfer failed"
            );
        } else {
            revert("Invalid state for emergency withdrawal");
        }

        escrow.state = EscrowState.EMERGENCY;

        emit EmergencyWithdrawal(escrowId, msg.sender);

        _snapshot(escrowId);
    }

    // ============ Admin Functions ============

    /**
     * @dev Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasuryAddress(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury address");

        address oldTreasury = treasuryAddress;
        treasuryAddress = newTreasury;

        emit TreasuryAddressUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Update the safety wallet address for emergency ejects
     * @param _safetyWallet Address of the cold storage wallet
     */
    function setSafetyWallet(address _safetyWallet) external onlyOwner {
        require(_safetyWallet != address(0), "Invalid safety wallet");
        address oldSafety = safetyWallet;
        safetyWallet = _safetyWallet;
        emit SafetyWalletUpdated(oldSafety, _safetyWallet);
    }

    /**
     * @dev Update the transition period for TRANSITION state
     * @param _newTransitionPeriod New transition period in seconds
     */
    function setTransitionPeriod(
        uint256 _newTransitionPeriod
    ) external onlyOwner {
        require(
            _newTransitionPeriod > 0,
            "Transition period must be greater than 0"
        );
        uint256 oldTransitionPeriod = transitionPeriod;
        transitionPeriod = _newTransitionPeriod;
        emit TransitionPeriodUpdated(oldTransitionPeriod, _newTransitionPeriod);
    }

    /**
     * @dev Admin function to forcefully release retainer funds from a TRANSITION escrow to the seller.
     * @param escrowId ID of the escrow transaction
     */
    function adminReleaseRetainer(
        uint256 escrowId
    ) external onlyOwner escrowExists(escrowId) nonReentrant {
        EscrowTransaction storage escrow = escrows[escrowId];
        TransitionHold storage hold = transitionHolds[escrowId];

        require(
            escrow.state == EscrowState.TRANSITION,
            "Escrow not in TRANSITION state"
        );
        require(!hold.isReleased, "Retainer already released");

        // Release retainer to seller
        require(
            idrxToken.transfer(escrow.seller, hold.retainedAmount),
            "Transfer to seller failed"
        );
        hold.isReleased = true;
        hold.isClaimed = true;
        escrow.state = EscrowState.COMPLETED;

        emit AdminRetainerReleased(
            escrowId,
            escrow.seller,
            hold.retainedAmount
        );
        _snapshot(escrowId);
    }

    /**
     * @dev Emergency eject funds from a specific escrow to the safety wallet
     * @param escrowId ID of the escrow to eject
     */
    function emergencyEjectEscrow(
        uint256 escrowId
    ) external onlyOwner whenPaused {
        require(safetyWallet != address(0), "Safety wallet not set");
        EscrowTransaction storage escrow = escrows[escrowId];
        require(escrow.state != EscrowState.EMERGENCY, "Already ejected");
        require(escrow.state != EscrowState.COMPLETED, "Already completed");
        require(escrow.state != EscrowState.REFUNDED, "Already refunded");
        require(escrow.state != EscrowState.EXPIRED, "Already expired");
        require(escrow.state != EscrowState.RESOLVED, "Already resolved");

        uint256 amountToEject = 0;

        if (escrow.state == EscrowState.CREATED) {
            amountToEject = escrow.totalFunded;
        } else if (
            escrow.state == EscrowState.FUNDED ||
            escrow.state == EscrowState.DELIVERED
        ) {
            amountToEject = escrow.amount;
        } else if (escrow.state == EscrowState.TRANSITION) {
            TransitionHold storage hold = transitionHolds[escrowId];
            if (!hold.isReleased) {
                amountToEject = hold.retainedAmount;
            }
        } else if (escrow.state == EscrowState.DISPUTED) {
            // Check if we are in post-split (Transition) or pre-split (Delivered)
            TransitionHold storage hold = transitionHolds[escrowId];
            if (hold.escrowId != 0) {
                // We have a transition hold, so we are post-split
                if (!hold.isReleased) {
                    amountToEject = hold.retainedAmount;
                }
            } else {
                // No transition hold, pre-split
                amountToEject = escrow.amount;
            }
        }

        if (amountToEject > 0) {
            escrow.state = EscrowState.EMERGENCY;
            require(
                idrxToken.transfer(safetyWallet, amountToEject),
                "Transfer failed"
            );
            emit EmergencyEjectEscrow(escrowId, amountToEject, safetyWallet);
            _snapshot(escrowId);
        }
    }

    /**
     * @dev Emergency eject funds from an active offer
     * @param offerId ID of the offer to eject
     */
    function emergencyEjectOffer(
        uint256 offerId
    ) external onlyOwner whenPaused {
        require(safetyWallet != address(0), "Safety wallet not set");
        Offer storage offer = offers[offerId];

        // Only eject if Active. If Accepted, funds moved to Escrow (handled by ejectEscrow).
        // If Rejected/Cancelled, funds already returned.
        require(offer.state == OfferState.ACTIVE, "Offer not active");

        uint256 amountToEject = offer.depositAmount;

        offer.state = OfferState.CANCELLED; // Terminate offer

        require(
            idrxToken.transfer(safetyWallet, amountToEject),
            "Transfer failed"
        );

        emit EmergencyEjectOffer(offerId, amountToEject, safetyWallet);
    }

    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Snapshot Logic ============

    struct Snapshot {
        uint256 balance;
        EscrowState state;
        uint256 timestamp;
    }

    mapping(uint256 => Snapshot[]) public history;

    function _snapshot(uint256 escrowId) internal {
        EscrowTransaction storage escrow = escrows[escrowId];
        history[escrowId].push(
            Snapshot({
                balance: escrow.amount, // Tracking the escrow amount as balance
                state: escrow.state,
                timestamp: block.timestamp
            })
        );
    }

    // ============ View Functions ============

    /**
     * @dev Calculate platform fee and seller payout
     * @param amount Total amount
     * @return platformFee Platform fee amount
     * @return sellerPayout Amount seller receives
     */
    function calculateFees(
        uint256 amount
    ) public pure returns (uint256 platformFee, uint256 sellerPayout) {
        platformFee = (amount * PLATFORM_FEE_BPS) / 10000;
        sellerPayout = amount - platformFee;
    }

    /**
     * @dev Get escrow details
     * @param escrowId ID of the escrow transaction
     */
    function getEscrow(
        uint256 escrowId
    ) external view returns (EscrowTransaction memory) {
        return escrows[escrowId];
    }

    /**
     * @dev Get transition hold details
     * @param escrowId ID of the escrow transaction
     */
    function getTransitionHold(
        uint256 escrowId
    ) external view returns (TransitionHold memory) {
        return transitionHolds[escrowId];
    }

    /**
     * @dev Get dispute details
     * @param escrowId ID of the escrow transaction
     */
    function getDispute(
        uint256 escrowId
    ) external view returns (Dispute memory) {
        return disputes[escrowId];
    }

    /**
     * @dev Check if a buyer has an active offer on a listing
     * @param listingId ID of the listing
     * @param buyer Address of the buyer
     * @return bool True if buyer has an active offer on this listing
     */
    function hasActiveOffer(
        uint256 listingId,
        address buyer
    ) external view returns (bool) {
        uint256 offerId = activeOffersByBuyerAndListing[listingId][buyer];
        if (offerId == 0) return false;
        return offers[offerId].state == OfferState.ACTIVE;
    }

    // ============ Storage Gap ============

    /**
     * @dev Storage gap for future upgrades
     * This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     */
    uint256[50] private __gap;
}
