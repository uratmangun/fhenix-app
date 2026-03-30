// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract EncryptedVotingMock {
    struct Product {
        bool exists;
        address productOwner;
        uint256 voteCount;
    }

    uint256 public productCount;

    mapping(uint256 productId => Product) private products;
    mapping(uint256 productId => mapping(address voter => bool)) public hasVotedForProduct;

    event ProductSubmitted(uint256 indexed productId, address indexed productOwner);
    event ProductVoteUpdated(uint256 indexed productId, address indexed voter, bool hasVoted);

    error InvalidProduct();
    error ProductOwnerCannotVote();

    // Creates a new product entry and assigns the caller as the product owner.
    function submitProduct() external returns (uint256 productId) {
        productId = productCount;
        Product storage product = products[productId];

        product.exists = true;
        product.productOwner = msg.sender;
        product.voteCount = 0;

        productCount = productId + 1;

        emit ProductSubmitted(productId, msg.sender);
    }

    // Toggles the caller's public vote state for a product while preventing self-voting.
    function setVoteState(uint256 productId, bool voted) external {
        Product storage product = products[productId];

        if (!product.exists) revert InvalidProduct();
        if (msg.sender == product.productOwner) revert ProductOwnerCannotVote();

        bool currentlyVoted = hasVotedForProduct[productId][msg.sender];

        if (currentlyVoted == voted) {
            emit ProductVoteUpdated(productId, msg.sender, voted);
            return;
        }

        if (voted) {
            product.voteCount += 1;
        } else {
            product.voteCount -= 1;
        }

        hasVotedForProduct[productId][msg.sender] = voted;

        emit ProductVoteUpdated(productId, msg.sender, voted);
    }

    // Returns the public aggregate vote count for a product.
    function getPublicVoteCount(uint256 productId) external view returns (uint256) {
        Product storage product = products[productId];
        if (!product.exists) revert InvalidProduct();
        return product.voteCount;
    }

    // Returns whether the product exists and which wallet submitted it.
    function getProductSummary(uint256 productId) external view returns (bool exists, address productOwner) {
        Product storage product = products[productId];
        exists = product.exists;
        productOwner = product.productOwner;
    }
}
