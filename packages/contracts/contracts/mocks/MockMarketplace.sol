// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../EscrowV1.sol";

contract MockMarketplace is IMarketplace {
    mapping(uint256 => Listing) public _listings;

    function setListing(
        uint256 listingId,
        address seller,
        uint256 askingPrice,
        ListingState state
    ) external {
        _listings[listingId] = Listing({
            id: listingId,
            seller: seller,
            title: "Mock Listing",
            ipfsMetadata: "ipfs://mock",
            askingPrice: askingPrice,
            createdAt: block.timestamp,
            verificationLevel: 1,
            state: state,
            ipAssignmentHash: bytes32(0),
            sellerSignature: "",
            ipSignedAt: 0,
            buildId: "",
            buildIdVerified: true
        });
    }

    function listings(uint256 listingId) external view override returns (
        uint256 id,
        address seller,
        string memory title,
        string memory ipfsMetadata,
        uint256 askingPrice,
        uint256 createdAt,
        uint8 verificationLevel,
        ListingState state,
        bytes32 ipAssignmentHash,
        bytes memory sellerSignature,
        uint256 ipSignedAt,
        string memory buildId,
        bool buildIdVerified
    ) {
        Listing memory listing = _listings[listingId];
        return (
            listing.id,
            listing.seller,
            listing.title,
            listing.ipfsMetadata,
            listing.askingPrice,
            listing.createdAt,
            listing.verificationLevel,
            listing.state,
            listing.ipAssignmentHash,
            listing.sellerSignature,
            listing.ipSignedAt,
            listing.buildId,
            listing.buildIdVerified
        );
    }
}
