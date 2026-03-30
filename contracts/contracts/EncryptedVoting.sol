// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FHE, euint64, euint8, InEuint8} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract EncryptedVoting {
    struct Product {
        string name;
        string url;
        string tagline;
        bool exists;
        address productOwner;
        euint64 encryptedVotes;
    }

    uint256 public productCount;

    mapping(uint256 productId => Product) private products;
    mapping(uint256 productId => mapping(address voter => bool)) public hasVotedForProduct;

    euint64 private immutable EUINT64_ZERO;
    euint64 private immutable EUINT64_ONE;

    event ProductSubmitted(uint256 indexed productId, string name, string url, string tagline, address indexed productOwner);
    event ProductVoteUpdated(uint256 indexed productId, address indexed voter, bool hasVoted);

    error InvalidProduct();
    error ProductOwnerCannotVote();

    constructor() {
        EUINT64_ZERO = FHE.asEuint64(0);
        EUINT64_ONE = FHE.asEuint64(1);
        FHE.allowThis(EUINT64_ZERO);
        FHE.allowThis(EUINT64_ONE);
    }

    // Creates a new encrypted-voting product entry and assigns the caller as the product owner.
    function submitProduct(
        string calldata name,
        string calldata url,
        string calldata tagline
    ) external returns (uint256 productId) {
        productId = productCount;
        Product storage product = products[productId];

        product.name = name;
        product.url = url;
        product.tagline = tagline;
        product.exists = true;
        product.productOwner = msg.sender;
        product.encryptedVotes = FHE.asEuint64(0);
        FHE.allowThis(product.encryptedVotes);

        productCount = productId + 1;

        emit ProductSubmitted(productId, name, url, tagline, msg.sender);
    }

    // Updates the caller's encrypted vote state for a product while preventing self-voting.
    function setEncryptedVoteState(uint256 productId, InEuint8 calldata encryptedVoteState) external {
        Product storage product = products[productId];

        if (!product.exists) revert InvalidProduct();
        if (msg.sender == product.productOwner) revert ProductOwnerCannotVote();

        bool currentlyVoted = hasVotedForProduct[productId][msg.sender];

        euint8 voteState = FHE.asEuint8(encryptedVoteState);

        if (currentlyVoted) {
            product.encryptedVotes = FHE.sub(product.encryptedVotes, EUINT64_ONE);
        } else {
            product.encryptedVotes = FHE.add(product.encryptedVotes, EUINT64_ONE);
        }
        FHE.allowThis(product.encryptedVotes);

        bool nowVoted = !currentlyVoted;
        hasVotedForProduct[productId][msg.sender] = nowVoted;

        FHE.allowSender(voteState);

        emit ProductVoteUpdated(productId, msg.sender, nowVoted);
    }

    // Returns the encrypted vote handle for plugin-based local tests and advanced clients.
    function getEncryptedVoteCount(uint256 productId) external view returns (euint64) {
        Product storage product = products[productId];
        if (!product.exists) revert InvalidProduct();
        return product.encryptedVotes;
    }

    // Returns the decrypted aggregate vote count for a product.
    function getPublicVoteCount(uint256 productId) external view returns (uint256) {
        Product storage product = products[productId];
        if (!product.exists) revert InvalidProduct();
        return FHE.getDecryptResult(product.encryptedVotes);
    }

    // Returns the public product metadata and owner wallet.
    function getProductSummary(
        uint256 productId
    )
        external
        view
        returns (
            string memory name,
            string memory url,
            string memory tagline,
            bool exists,
            address productOwner
        )
    {
        Product storage product = products[productId];

        name = product.name;
        url = product.url;
        tagline = product.tagline;
        exists = product.exists;
        productOwner = product.productOwner;
    }
}
