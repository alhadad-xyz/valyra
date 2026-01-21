// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MarketplaceV1
 * @dev Core marketplace contract for managing listings, seller registration, and IP assignment
 * @notice This is a skeleton implementation with function signatures for the Valyra marketplace
 */
contract MarketplaceV1 is Initializable, OwnableUpgradeable, PausableUpgradeable, ReentrancyGuard, UUPSUpgradeable {
    
    // ============ Enums ============
    
    enum ListingState {
        ACTIVE,      // Available for purchase
        PENDING,     // Buyer has deposited, awaiting handover
        COMPLETED,   // Transaction successful
        CANCELLED,   // Seller cancelled
        DISPUTED,    // Under dispute
        PAUSED       // Health check failed
    }
    
    enum VerificationLevel {
        BASIC,       // Email verification only
        STANDARD,    // DNS + Registrar verification
        ENHANCED     // OAuth revenue/analytics verified + Build ID matched
    }
    
    // ============ Structs ============
    
    struct Listing {
        uint256 id;
        address seller;
        string title;
        string ipfsMetadata;          // IPFS hash for full description
        uint256 askingPrice;          // In IDRX (18 decimals)
        uint256 createdAt;
        VerificationLevel verificationLevel;
        ListingState state;
        // IP Assignment Fields
        bytes32 ipAssignmentHash;     // Hash of IP assignment template
        bytes sellerSignature;        // Wallet signature of the hash
        uint256 ipSignedAt;           // Timestamp of signature
        // Build ID Verification
        string buildId;               // Unique identifier linking live site to codebase
        bool buildIdVerified;         // Agent verified buildId matches repo commit
    }
    
    struct SellerActivity {
        address seller;
        uint256 lastHeartbeat;        // Last activity timestamp
        uint256 ignoredOffers;        // Count of ignored offers
        bool isActive;                // Whether seller is active
        bool isPaused;                // Auto-paused due to inactivity
    }
    
    struct SellerStake {
        address seller;
        uint256 stakeAmount;          // ~$50 USD equivalent in IDRX
        uint256 stakedAt;
        bool isActive;                // Whether stake is active
        uint256 slashCount;           // Number of times slashed
    }
    
    // ============ State Variables ============
    
    uint256 private _listingIdCounter;
    mapping(uint256 => Listing) public listings;
    mapping(address => SellerActivity) public sellerActivity;
    mapping(address => SellerStake) public sellerStakes;
    mapping(address => VerificationLevel) public sellerVerificationLevel;
    mapping(address => uint256) public activeListingsCount;
    
    // Constants
    uint256 public constant MINIMUM_SELLER_STAKE = 750_000 * 1e18;  // ~$50 in IDRX
    uint256 public constant SLASH_PENALTY = 250_000 * 1e18;         // ~$17 per violation
    uint256 public constant GENESIS_SELLER_LIMIT = 50;              // First 50 verified sellers
    uint256 public constant HEARTBEAT_INTERVAL = 30 days;
    uint256 public constant WARNING_PERIOD = 7 days;
    uint256 public constant PAUSE_AFTER_WARNING = 7 days;
    uint256 public constant MAX_IGNORED_OFFERS = 3;
    uint256 public constant EMERGENCY_COOLDOWN = 72 hours;
    
    // Genesis Program
    bool public genesisProgram;
    uint256 public genesisSellersCount;
    mapping(address => bool) public isGenesisSeller;
    
    // Agent address for automated operations
    address public agentAddress;
    
    // IDRX token
    // IDRX token
    IERC20 public idrxToken;

    // Emergency Withdrawal
    mapping(address => uint256) public emergencyWithdrawTime;
    
    // ============ Events ============
    
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        string title,
        uint256 askingPrice,
        VerificationLevel verificationLevel
    );
    
    event ListingUpdated(
        uint256 indexed listingId,
        string ipfsMetadata,
        uint256 newPrice
    );
    
    event ListingCancelled(uint256 indexed listingId);
    
    event ListingPaused(uint256 indexed listingId, string reason);
    
    event ListingResumed(uint256 indexed listingId);
    
    event BuildIdVerified(uint256 indexed listingId, bool verified);
    
    event HeartbeatRecorded(address indexed seller, uint256 timestamp);
    
    event SellerStaked(address indexed seller, uint256 amount);
    
    event StakeWithdrawn(address indexed seller, uint256 amount);
    
    event GenesisSellerJoined(address indexed seller, uint256 genesisNumber);
    
    event SellerPaused(address indexed seller);
    
    event AgentAddressUpdated(address indexed oldAgent, address indexed newAgent);

    event EmergencyWithdrawRequested(address indexed user, uint256 executionTime);
    event EmergencyWithdrawExecuted(address indexed user, uint256 amount);
    event SellerSlashed(address indexed seller, uint256 amount, string reason, uint256 newSlashCount);
    
    // ============ Modifiers ============
    
    modifier onlyAgent() {
        require(msg.sender == agentAddress, "Only agent can call this function");
        _;
    }
    
    modifier onlySeller(uint256 listingId) {
        require(listings[listingId].seller == msg.sender, "Only seller can call this function");
        _;
    }
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    // ============ Initializer ============
    
    /**
     * @notice Initializes the marketplace contract
     * @dev Initializes the contract with owner and IDRX token address. Called once during proxy deployment.
     * @param _idrxToken Address of the IDRX ERC20 token
     * @param _agentAddress Address of the AI agent for automated operations
     */
    function initialize(address _idrxToken, address _agentAddress) public initializer {
        __Ownable_init(msg.sender);
        __Pausable_init();
        
        require(_idrxToken != address(0), "Invalid IDRX token address");
        require(_agentAddress != address(0), "Invalid agent address");
        
        idrxToken = IERC20(_idrxToken);
        agentAddress = _agentAddress;
        genesisProgram = true;
        genesisSellersCount = 0;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Creates a new listing for a digital asset/product
     * @dev Creates a new marketplace listing. Requires seller to have an active stake.
     * @param title Title of the listing
     * @param ipfsMetadata IPFS hash containing full listing details
     * @param askingPrice Price in IDRX (18 decimals)
     * @param level Verification level of the seller
     * @param ipAssignmentHash Hash of the IP assignment template
     * @param sellerSignature Seller's wallet signature of the IP assignment hash
     * @param buildId Build ID for verification
     * @return listingId The ID of the created listing
     */
    function createListing(
        string memory title,
        string memory ipfsMetadata,
        uint256 askingPrice,
        VerificationLevel level,
        bytes32 ipAssignmentHash,
        bytes memory sellerSignature,
        string memory buildId
    ) external whenNotPaused nonReentrant returns (uint256 listingId) {
        require(sellerStakes[msg.sender].isActive, "Must stake to list");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(askingPrice > 0, "Price must be greater than 0");
        
        // Generate unique listing ID
        listingId = _listingIdCounter++;
        
        // Create listing struct
        listings[listingId] = Listing({
            id: listingId,
            seller: msg.sender,
            title: title,
            ipfsMetadata: ipfsMetadata,
            askingPrice: askingPrice,
            createdAt: block.timestamp,
            verificationLevel: level,
            state: ListingState.ACTIVE,
            ipAssignmentHash: ipAssignmentHash,
            sellerSignature: sellerSignature,
            ipSignedAt: block.timestamp,
            buildId: buildId,
            buildIdVerified: false
        });
        
        // Initialize or update seller activity
        SellerActivity storage activity = sellerActivity[msg.sender];
        activity.seller = msg.sender;
        activity.lastHeartbeat = block.timestamp;
        activity.isActive = true;
        
        // Update seller verification level
        sellerVerificationLevel[msg.sender] = level;
        
        // Increment active listings count
        activeListingsCount[msg.sender]++;
        
        // Emit listing created event
        emit ListingCreated(
            listingId,
            msg.sender,
            title,
            askingPrice,
            level
        );
    }
    
    /**
     * @notice Updates the metadata or price of an existing listing
     * @dev Updates an existing listing's metadata and/or price. Only callable by the seller.
     * @param listingId ID of the listing to update
     * @param ipfsMetadata New IPFS metadata hash (pass empty string to skip)
     * @param newPrice New asking price (pass 0 to skip)
     */
    function updateListing(
        uint256 listingId,
        string memory ipfsMetadata,
        uint256 newPrice
    ) external onlySeller(listingId) whenNotPaused {
        require(listings[listingId].state == ListingState.ACTIVE, "Listing not active");
        
        Listing storage listing = listings[listingId];
        
        // Update metadata if provided
        if (bytes(ipfsMetadata).length > 0) {
            listing.ipfsMetadata = ipfsMetadata;
        }
        
        // Update price if provided and valid
        if (newPrice > 0) {
            listing.askingPrice = newPrice;
        }
        
        emit ListingUpdated(listingId, ipfsMetadata, newPrice);
    }
    
    /**
     * @notice Cancels an active listing, removing it from the marketplace
     * @dev Cancels a listing. Only callable by the seller.
     * @param listingId ID of the listing to cancel
     */
    function cancelListing(uint256 listingId) external onlySeller(listingId) {
        require(listings[listingId].state == ListingState.ACTIVE, "Listing not active");
        
        // Update listing state
        listings[listingId].state = ListingState.CANCELLED;
        
        // Decrement active listings count
        if (activeListingsCount[msg.sender] > 0) {
            activeListingsCount[msg.sender]--;
        }
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @notice Pauses a listing when health checks fail (Agent only)
     * @dev Pauses a listing (agent only, for health check failures)
     * @param listingId ID of the listing to pause
     */
    function pauseListing(uint256 listingId) external onlyAgent {
        require(listings[listingId].state == ListingState.ACTIVE, "Listing not active");
        
        listings[listingId].state = ListingState.PAUSED;
        
        // Decrement active listings count
        if (activeListingsCount[listings[listingId].seller] > 0) {
            activeListingsCount[listings[listingId].seller]--;
        }
        
        emit ListingPaused(listingId, "Health check failed");
    }
    
    /**
     * @notice Resumes a previously paused listing
     * @dev Resumes a paused listing. Only callable by the seller.
     * @param listingId ID of the listing to resume
     */
    function resumeListing(uint256 listingId) external onlySeller(listingId) {
        require(listings[listingId].state == ListingState.PAUSED, "Listing not paused");
        
        listings[listingId].state = ListingState.ACTIVE;
        activeListingsCount[msg.sender]++;
        
        emit ListingResumed(listingId);
    }
    
    /**
     * @notice Retrieves a paginated list of all active listings
     * @dev Gets a paginated list of active listings. Warning: costly for large datasets, use with reasonable limit.
     * @param offset Starting index for pagination
     * @param limit Maximum number of listings to return
     * @return activeListings Array of active listings
     */
    function getActiveListings(
        uint256 offset,
        uint256 limit
    ) external view returns (Listing[] memory activeListings) {
        uint256 total = _listingIdCounter;
        uint256 count = 0;
        
        // First pass: count active listings
        for (uint256 i = 0; i < total; i++) {
            if (listings[i].state == ListingState.ACTIVE) {
                count++;
            }
        }
        
        // Edge case: no active listings or offset beyond total
        if (count == 0 || offset >= count) {
            return new Listing[](0);
        }
        
        // Edge case: limit is 0
        if (limit == 0) {
            return new Listing[](0);
        }
        
        // Adjust limit if it exceeds remaining items
        uint256 remaining = count - offset;
        if (limit > remaining) {
            limit = remaining;
        }
        
        activeListings = new Listing[](limit);
        uint256 added = 0;
        uint256 skipped = 0;
        
        for (uint256 i = 0; i < total && added < limit; i++) {
            if (listings[i].state == ListingState.ACTIVE) {
                if (skipped < offset) {
                    skipped++;
                } else {
                    activeListings[added] = listings[i];
                    added++;
                }
            }
        }
    }
    
    /**
     * @notice Verifies that a listing's build ID matches its source code (Agent only)
     * @dev Verifies the build ID for a listing. Optionally upgrades seller verification to ENHANCED.
     * @param listingId ID of the listing
     * @param verified Whether the build ID is verified
     */
    function verifyBuildId(uint256 listingId, bool verified) external onlyAgent {
        require(listings[listingId].id == listingId, "Listing does not exist");
        
        listings[listingId].buildIdVerified = verified;
        
        if (verified && listings[listingId].verificationLevel == VerificationLevel.STANDARD) {
             listings[listingId].verificationLevel = VerificationLevel.ENHANCED;
        }
        
        emit BuildIdVerified(listingId, verified);
    }
    
    /**
     * @notice Records seller activity to prevent auto-pausing
     * @dev Records a heartbeat for seller activity tracking. Updates lastHeartbeat timestamp.
     */
    function recordHeartbeat() external {
        SellerActivity storage activity = sellerActivity[msg.sender];
        activity.lastHeartbeat = block.timestamp;
        activity.seller = msg.sender; // Ensure seller address is set
        activity.isActive = true;
        
        emit HeartbeatRecorded(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Registers the caller as a Genesis Seller if eligible
     * @dev Registers caller as a Genesis Seller (first 50 verified sellers). Requires STANDARD verification or higher.
     */
    function joinGenesis() external {
        require(genesisProgram, "Genesis program has ended");
        require(genesisSellersCount < GENESIS_SELLER_LIMIT, "Genesis program is full");
        require(!isGenesisSeller[msg.sender], "Already a Genesis Seller");
        require(sellerVerificationLevel[msg.sender] >= VerificationLevel.STANDARD, "Must be verified for Genesis");
        
        // Mark as Genesis Seller
        isGenesisSeller[msg.sender] = true;
        genesisSellersCount++;
        
        emit GenesisSellerJoined(msg.sender, genesisSellersCount);
    }
    
    /**
     * @notice Stakes IDRX tokens to become an active seller
     * @dev Stakes IDRX to become a seller. Wiaved for Genesis Sellers.
     */
    function stakeToSell() external nonReentrant {
        require(!sellerStakes[msg.sender].isActive, "Already staked");
        
        // Genesis Seller Program: First 50 verified sellers (Level 2+) get free listing
        if (genesisProgram && genesisSellersCount < GENESIS_SELLER_LIMIT && sellerVerificationLevel[msg.sender] >= VerificationLevel.STANDARD) {
            
            sellerStakes[msg.sender] = SellerStake({
                seller: msg.sender,
                stakeAmount: 0,  // Waived for Genesis
                stakedAt: block.timestamp,
                isActive: true,
                slashCount: 0
            });
            
            isGenesisSeller[msg.sender] = true; // Fix double counting
            genesisSellersCount++;
            emit GenesisSellerJoined(msg.sender, genesisSellersCount);
        } else {
            // Regular staking: Transfer IDRX from seller
            require(
                idrxToken.transferFrom(msg.sender, address(this), MINIMUM_SELLER_STAKE),
                "Stake transfer failed"
            );
            
            sellerStakes[msg.sender] = SellerStake({
                seller: msg.sender,
                stakeAmount: MINIMUM_SELLER_STAKE,
                stakedAt: block.timestamp,
                isActive: true,
                slashCount: 0
            });
            
            emit SellerStaked(msg.sender, MINIMUM_SELLER_STAKE);
        }
        
        // Initialize seller activity
        SellerActivity storage activity = sellerActivity[msg.sender];
        activity.seller = msg.sender;
        activity.lastHeartbeat = block.timestamp;
        activity.isActive = true;
        
        emit HeartbeatRecorded(msg.sender, block.timestamp);
    }
    
    /**
     * @notice Withdraws staked IDRX tokens if the seller has no active listings
     * @dev Withdraws staked IDRX (only if no active listings). Deactivates status if below minimum.
     * @param amount Amount to withdraw in IDRX (18 decimals)
     */
    function withdrawStake(uint256 amount) external nonReentrant {
        require(sellerStakes[msg.sender].isActive, "No active stake");
        require(activeListingsCount[msg.sender] == 0, "Cannot withdraw with active listings");
        require(amount > 0, "Amount must be greater than 0");
        require(sellerStakes[msg.sender].stakeAmount >= amount, "Insufficient stake balance");
        
        // Update stake amount
        sellerStakes[msg.sender].stakeAmount -= amount;
        
        // If stake falls below minimum, deactivate
        if (sellerStakes[msg.sender].stakeAmount < MINIMUM_SELLER_STAKE) {
            sellerStakes[msg.sender].isActive = false;
        }
        
        // Transfer tokens back to seller
        require(
            idrxToken.transfer(msg.sender, amount),
            "Stake withdrawal failed"
        );
        
        emit StakeWithdrawn(msg.sender, amount);
    }
    
    /**
     * @notice Requests an emergency withdrawal of all staked funds
     * @dev Sets the emergency withdrawal timestamp. Valid for execution after 72 hours.
     */
    function requestEmergencyWithdraw() external {
        require(sellerStakes[msg.sender].stakeAmount > 0, "No stake to withdraw");
        emergencyWithdrawTime[msg.sender] = block.timestamp + EMERGENCY_COOLDOWN;
        emit EmergencyWithdrawRequested(msg.sender, emergencyWithdrawTime[msg.sender]);
    }

    /**
     * @notice Executes the emergency withdrawal after the cooldown period
     * @dev Transfers all staked funds to the user. Bypasses standard withdrawal checks.
     */
    function executeEmergencyWithdraw() external nonReentrant {
        uint256 unlockTime = emergencyWithdrawTime[msg.sender];
        require(unlockTime > 0, "No request found");
        require(block.timestamp >= unlockTime, "Cooldown active");
        
        uint256 amount = sellerStakes[msg.sender].stakeAmount;
        require(amount > 0, "No funds to withdraw");
        
        // Reset state
        delete sellerStakes[msg.sender];
        delete emergencyWithdrawTime[msg.sender];
        
        // Also clear activity to prevent zombie state
        delete sellerActivity[msg.sender];
        
        require(idrxToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit EmergencyWithdrawExecuted(msg.sender, amount);
    }

    /**
     * @notice Pauses a seller who has been inactive for too long (Agent only)
     * @dev Pauses an inactive seller (agent only). Based on checkSellerActivity logic.
     * @param seller Address of the seller to pause
     */
    function pauseInactiveSeller(address seller) external onlyAgent {
        (bool needsWarning, bool shouldPause) = checkSellerActivity(seller);
        
        if (shouldPause) {
            SellerActivity storage activity = sellerActivity[seller];
            activity.isPaused = true;
            activity.isActive = false;
            
            // Should also potentially pause their listings
            // For MVP we just mark them as paused seller
            
            emit SellerPaused(seller);
        }
    }

    /**
     * @notice Penalizes a seller for violations by deducting stake
     * @dev Slashes the seller's stake. Deactivates seller if stake falls below minimum.
     * @param seller Address of the seller to slash
     * @param reason Reason for the flashing
     */
    function slashSeller(address seller, string memory reason) external onlyAgent {
        require(sellerStakes[seller].isActive, "Seller not active");
        require(sellerStakes[seller].stakeAmount >= SLASH_PENALTY, "Insufficient stake to slash");
        
        // Deduct penalty
        sellerStakes[seller].stakeAmount -= SLASH_PENALTY;
        sellerStakes[seller].slashCount++;
        
        // Check if remaining stake is sufficient
        if (sellerStakes[seller].stakeAmount < MINIMUM_SELLER_STAKE) {
            sellerStakes[seller].isActive = false;
            sellerActivity[seller].isActive = false;
            sellerActivity[seller].isPaused = true;
        }
        
        // Transfer slashed amount to treasury or burn (for now keep in contract or transfer to agent/treasury)
        // PRD says "deduct", assuming it stays in contract or goes to treasury.
        // For MVP, we'll keep it in the contract (effectively confiscated from withdrawal pool)
        // Logic: transferFrom was already done. The contract holds the funds. 
        // We just reduced the `stakeAmount` which is the withdrawable amount.
        // So the tokens remain in the contract but are no longer withdrawable by the seller.
        
        emit SellerSlashed(seller, SLASH_PENALTY, reason, sellerStakes[seller].slashCount);
    }
    
    /**
     * @notice Checks if a seller requires a warning or suspension due to inactivity
     * @dev Checks if a seller needs warning or should be paused based on heartbeat intervals.
     * @param seller Address of the seller to check
     * @return needsWarning Whether the seller needs a warning
     * @return shouldPause Whether the seller should be paused
     */
    function checkSellerActivity(address seller) public view returns (bool needsWarning, bool shouldPause) {
        SellerActivity storage activity = sellerActivity[seller];
        uint256 timeSinceHeartbeat = block.timestamp - activity.lastHeartbeat;
        
        needsWarning = timeSinceHeartbeat > HEARTBEAT_INTERVAL;
        shouldPause = timeSinceHeartbeat > (HEARTBEAT_INTERVAL + WARNING_PERIOD + PAUSE_AFTER_WARNING);
    }
    
    /**
     * @notice Checks if a seller is eligible to withdraw their stake
     * @dev Checks if a seller can withdraw their stake. Requires active stake, no active listings, and non-zero balance.
     * @param seller Address of the seller to check
     * @return canWithdraw Whether the seller can withdraw
     * @return reason Reason string if withdrawal is not allowed
     */
    function canWithdrawStake(address seller) public view returns (bool canWithdraw, string memory reason) {
        if (!sellerStakes[seller].isActive) {
            return (false, "No active stake");
        }
        if (activeListingsCount[seller] > 0) {
            return (false, "Has active listings");
        }
        if (sellerStakes[seller].stakeAmount == 0) {
            return (false, "No stake balance");
        }
        return (true, "");
    }
    
    /**
     * @notice Updates the address of the AI agent
     * @dev Updates the agent address. Only callable by contract owner.
     * @param newAgent New agent address
     */
    function setAgentAddress(address newAgent) external onlyOwner {
        require(newAgent != address(0), "Invalid agent address");
        address oldAgent = agentAddress;
        agentAddress = newAgent;
        emit AgentAddressUpdated(oldAgent, newAgent);
    }
    
    /**
     * @notice Manually ends the Genesis Seller program
     * @dev Ends the genesis program. Only callable by contract owner.
     */
    function endGenesisProgram() external onlyOwner {
        require(genesisProgram, "Already ended");
        genesisProgram = false;
    }
    
    /**
     * @notice Checks if the Genesis Seller program is currently active
     * @dev Checks if genesis program is still active and limit not reached.
     * @return bool Whether an address can join the genesis program
     */
    function canJoinGenesisProgram() external view returns (bool) {
        return genesisProgram && genesisSellersCount < GENESIS_SELLER_LIMIT;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Pauses the entire marketplace contract (Emergency only)
     * @dev Pauses the contract. Only callable by contract owner.
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @notice Unpauses the marketplace contract
     * @dev Unpauses the contract. Only callable by contract owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // ============ UUPS Upgrade Authorization ============
    
    /**
     * @dev Authorizes an upgrade to a new implementation
     * @param newImplementation Address of the new implementation
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
